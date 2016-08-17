#!/usr/bin/env python

import sys
import os
import os.path
import math
import czifile
import numpy as np
from scipy.misc import toimage
import json
import re

class LazyCziConverter (object):

    def __init__(self, czifilename, renormalize=False):
        self._fo = czifile.CziFile(czifilename)

        # sanity check dimensions
        self._Z = self._fo.axes.find('Z')
        if self._Z < 0:
            self._Z = None
        self._Y = self._fo.axes.find('Y')
        self._X = self._fo.axes.find('X')
        assert self._Y >= 0
        assert self._X == self._Y + 1
        self._slc = slice(self._Y,self._X+1)

        # check interleaved pixel config
        assert (self._slc.stop+1) == len(self._fo.axes), (self._slc.stop, len(self._fo.axes))
        assert self._fo.shape[self._slc.stop] in [1, 3], self._fo.shape
        assert self._fo.axes[self._slc] == 'YX', self._fo.axes[self._slc]

        # check multi-channel config
        self._C = self._fo.axes.find('C')
        assert self._C >= 0
        channel = self._fo.start[self._C]
        assert self._fo.shape[self._C] == 1 or self._fo.shape[self._slc.stop] == 1, \
            "do not understand multi-channel interleaved shape %s" % self._fo.shape

        # sort out segments into channel zoom tiers
        self._channel_tiers = [ dict() for c in range(self._fo.shape[self._C]) ]
        self._channel_tier_maps = [ dict() for c in range(self._fo.shape[self._C]) ]

        v0 = None
        v1 = None
        tile_size = (0, 0)

        for entry in self._fo.subblock_directory:
            assert len(entry.shape) == len(self._fo.shape)
            assert entry.axes == self._fo.axes

            channel = entry.start[self._C]
            
            # HACK: discard all but middle plane if there is a Z stack
            if self._Z is not None:
                if entry.start[self._Z] != (entry.shape[self._Z]/2):
                    continue
        
            # infer zoom from canvas size to tile size ratio
            zoom = map(lambda c, t: c/t, entry.shape[self._slc], entry.stored_shape[self._slc])
            assert zoom[0] == zoom[1]
            zoom = zoom[0]
        
            if zoom not in self._channel_tiers[channel]:
                self._channel_tiers[channel][zoom] = []

            # tile bounding box in canvas coordinates
            bbox = (entry.start[self._slc], tuple(map(lambda s, l: s+l, entry.start[self._slc], entry.shape[self._slc])))
            
            self._channel_tiers[channel][zoom].append((bbox, entry))

            # Figure total shape too...
            if v0 is None:
                v0 = bbox[0]
                v1 = bbox[1]
            else:
                v0 = map(lambda v, b: min(v, b), v0, bbox[0])
                v1 = map(lambda v, b: max(v, b), v1, bbox[1])
            tile_size = tuple(map(lambda a, b: max(a, b), tile_size, entry.stored_shape[self._slc]))

        # build up tile bbox maps for each zoom tier for efficient intersection tests
        for channel in range(self._fo.shape[self._C]):
            for zoom, bbox_entries in self._channel_tiers[channel].items():
                # pack as (v0.y, v0.x, v1.y, v1.x) for each entry
                bboxes = np.zeros( (len(bbox_entries), 4), dtype=np.int32 )
                for i in range(bboxes.shape[0]):
                    bboxes[i,0:2] = np.array(bbox_entries[i][0][0], dtype=np.int32)
                    bboxes[i,2:4] = np.array(bbox_entries[i][0][1], dtype=np.int32)
                # for fancy-indexing by boolean arrays, repeat entry indexes into array
                boxmap = np.array( range(len(bbox_entries)), dtype=np.int32 )
                self._channel_tier_maps[channel][zoom] = (bboxes, boxmap)

        channels = self._fo.metadata.findall('Metadata/DisplaySetting/Channels/Channel')
        assert channels, 'found no Metadata/DisplaySetting/Channels/Channel elements in CZI metadata'
        self._channel_names_long = [ c.get('Name') for c in channels ]
        self._channel_names = [ c.find('ShortName').text for c in channels ]
        self._channel_colors = [ c.find('Color').text if c.find('Color') is not None else None for c in channels ]
        
        self._bbox_native = (tuple(v0), tuple(v1))
        self._bbox_zeroed = ((0, 0), (v1[0]-v0[0], v1[1]-v0[1]))
        self._tile_size = tile_size
        self._zoom_levels = self._channel_tiers[0].keys()
        self._zoom_levels.sort()
        
        sys.stderr.write('CZI %s tile-size %s %s\n  channels: %s\n  bounding-box: %s native or shape %s\n  zoom levels: %s\n' % (
            ' '.join(map(lambda d, s: '%s=%d' % (d, s), self._fo.axes, self._fo.shape)),
            'x'.join(map(str, self._tile_size)), self._fo.dtype,
            ', '.join([
                '%s (%s %s)' % (self._channel_names[i], self._channel_names_long[i], self._channel_colors[i])
                for i in range(self._fo.shape[self._C])
            ]),
            self._bbox_native, 'x'.join(map(str, self._bbox_zeroed[1])), self._zoom_levels
        ))

        if renormalize and self._fo.dtype not in [np.uint8]:
            sys.stderr.write('Finding per-channel value ranges for dynamic normalization...\n')
            self._channel_ranges = [ self._value_range(channel) for channel in range(self._fo.shape[self._C]) ]
        else:
            self._channel_ranges = None

        # HACK: try to configure a tile cache for row-major tile grid traversals
        # 1. assume we will output tiles no larger than current tile size
        # 2. assume that up to 3 tile rows might be active due to overlapping source tiles
        overlap_factor = max([float(e.text) for e in self._fo.metadata.findall('Metadata/Experiment/ExperimentBlocks/AcquisitionBlock/SubDimensionSetups/RegionsSetup/SampleHolder/Overlap') ])

        row_tile_count = math.ceil(self._bbox_zeroed[1][1] / (self._tile_size[1] - self._tile_size[1] * overlap_factor))
        self._tile_cache_size = row_tile_count * 3 + 1
        # use dict as cache... key: (entry, dtype), value: [data, clock]
        self._tile_cache = dict()
        self._tile_cache_clock = 0

        sys.stderr.write('Estimating %d tiles per row at zoom level 1 or %d tile cache size\n' % (row_tile_count, self._tile_cache_size))

        # get per-dimension distances and turn meter value into micrometer
        self.mpps = dict([
            (dx.get('Id'), float(dx.find('Value').text) * 1E6)
            for dx in self._fo.metadata.findall('Metadata/Scaling/Items/Distance')
        ])
        sys.stderr.write('Image reported microns per pixel: %s\n' % self.mpps)

    def canvas_size(self):
        return self._bbox_zeroed[1]

    def num_channels(self):
        return len(self._channel_tiers)
            
    def _value_range(self, channelno):
        v0, v1 = None, None
        zooms = self._channel_tiers[channelno].keys()
        zooms.sort()
        for bbox, entry in self._channel_tiers[channelno][1]:
            data = self._entry_asarray(entry)
            if v0 is None:
                v0 = data.min()
                v1 = data.max()
            else:
                v0 = min(v0, data.min())
                v1 = max(v1, data.max())
        sys.stderr.write('Channel %d: %s .. %s (%s)\n' % (channelno, v0, v1, self._channel_names[channelno]))
        return (v0, v1)

    def _get_intersecting_bbox_entries(self, channelno, zoom, bbox_native):
        """Find CZI tiles that intersect bbox in native canvas coordinates."""

        bboxes, boxmap = self._channel_tier_maps[channelno][zoom]

        # non-intersects are either above or below the desired bbox
        y_nonintersects = (bboxes[:,2] <= bbox_native[0]) + (bboxes[:,0] >= bbox_native[2])
        x_nonintersects = (bboxes[:,3] <= bbox_native[1]) + (bboxes[:,1] >= bbox_native[3])
        nonintersects = y_nonintersects + x_nonintersects

        # use fancy-indexing with intersection boolean map to get sparse list of entry indices
        # and project out those entries for the zoom tier
        return [ (bboxes[i,:], self._channel_tiers[channelno][zoom][i][1]) for i in boxmap[~nonintersects] ]
                

    def get_tile_data(self, channelno, zoom, slc, dtype=np.uint8, fill=None, range_accum=None):
        """Project a tile array for the given channel, zoom, and YX slice.

           slc MUST have non-negative integer start and stop and no step.

           fill specifies tile fill value to cover sparse tile regions
           or zeros if None (default).

           range_accum, if not Null, must be a list of length 2 in one
           of two forms:

             - [None, None]: will be mutated to contain [v0, v1]

             - [A, B]: will be mutated to contain [min(v0,A), max(v1,B)]

           where v0 and v1 are the minimum and maximum values in this
           tile, respectively. This considers only pixels acquired in
           the source CZI and ignores fill values.

           Slice coordinates are in zero-based canvas pixel units,
           e.g. (slice(0,1), slice(0,1)) at 64:1 zoom will be a single
           pixel summarizing the same canvas area as (slice(0,64),
           slice(0,64)) at 1:1 zoom.

        """
        assert type(slc) == tuple
        assert len(slc) == 2

        def slc_check(slc, L):
            assert type(slc) == slice
            assert slc.step is None
            assert slc.start >= 0
            assert (slc.start * zoom) < L
            assert slc.stop > slc.start
            bounds = [slc.start * zoom, min(L/zoom, slc.stop) * zoom]
            return slice(*bounds)

        # do a little sanity checking and convert back to 1:1 pixel units with cropping to canvas
        slc = map(slc_check, slc, self._bbox_zeroed[1])
        
        # this should now be in same format as one row of self._channel_tier_maps[0]
        bbox = np.array([slc[0].start, slc[1].start, slc[0].stop, slc[1].stop], dtype=np.int32)

        # native offset
        native_offset = np.array([self._bbox_native[0][0], self._bbox_native[0][1], self._bbox_native[0][0], self._bbox_native[0][1]], dtype=np.int32)
        
        # and this is back in native coordinate system
        bbox_native = bbox + native_offset

        # composite output buffer
        output = np.zeros(((bbox[2]-bbox[0])/zoom, (bbox[3]-bbox[1])/zoom) + (self._fo.shape[-1],), dtype=dtype)

        if fill is not None:
            output[:,:,:] = fill
        
        # these entries overlap bbox by at least one pixel in canvas space
        for ebbox_native, entry in self._get_intersecting_bbox_entries(channelno, zoom, bbox_native):

            # find overlapping sub-rectangle in reduced resolution native canvas space
            overlap_native = np.array(
                tuple(map(max, bbox_native[0:2]/zoom, ebbox_native[0:2]/zoom))
                + tuple(map(min, bbox_native[2:4]/zoom, ebbox_native[2:4]/zoom)),
                dtype=np.int32
            )

            # find reduced resolution grid coordinates of overlap in entry tile and in output tile
            src_overlap = overlap_native.copy()
            src_overlap[0:2] -= np.array(entry.start[self._slc][0:2], dtype=np.int32) / zoom
            src_overlap[2:4] -= np.array(entry.start[self._slc][0:2], dtype=np.int32) / zoom

            dst_overlap = overlap_native.copy()
            dst_overlap[0:2] -= bbox_native[0:2] / zoom
            dst_overlap[2:4] -= bbox_native[0:2] / zoom

            assert src_overlap[0] >= 0
            assert src_overlap[1] >= 0
            assert src_overlap[2] <= entry.stored_shape[self._slc][0]
            assert src_overlap[3] <= entry.stored_shape[self._slc][1]

            #print overlap_native, zoom, src_overlap, dst_overlap
            
            # get decoded tile data to slice and composite
            data = self._entry_asarray_cached(entry, dtype)

            # avoid empty slicing due to reduced resolution
            if (src_overlap[2] - src_overlap[0]) > 0 and (src_overlap[3] - src_overlap[1]) > 0:
                data_sliced = data[
                    src_overlap[0]:src_overlap[2],
                    src_overlap[1]:src_overlap[3],
                    :
                ]
            
                if range_accum is not None:
                    # accumulate active pixel value range
                    v0 = data_sliced.min()
                    v1 = data_sliced.max()
                    if range_accum[0] is None:
                        range_accum[0] = v0
                        range_accum[1] = v1
                    else:
                        range_accum[0] = min(v0, range_accum[0])
                        range_accum[1] = max(v1, range_accum[1])

                output[
                    dst_overlap[0]:dst_overlap[2],
                    dst_overlap[1]:dst_overlap[3],
                    :
                ] = data_sliced
        
        return output

    def _entry_asarray_cached(self, entry, dtype=None):
        cache_key = (entry, dtype)
        if cache_key in self._tile_cache:
            # use cached copy and update last-use time
            data = self._tile_cache[cache_key][0]
            self._tile_cache[cache_key][1] = self._tile_cache_clock
            #sys.stderr.write('.')
        else:
            items = self._tile_cache.items()
            if len(items) >= self._tile_cache_size:
                # evict oldest item
                items.sort(key=lambda item: item[1][1])
                victim_key = items[0][0]
                items = None
                del self._tile_cache[victim_key]
                #sys.stderr.write('E')
            else:
                #sys.stderr.write('L')
                pass

            # insert new item
            data = self._entry_asarray(entry, dtype)
            self._tile_cache[cache_key] = [data, self._tile_cache_clock]
            
        self._tile_cache_clock += 1
        
        return data
    
    def _entry_asarray(self, entry, dtype=None):
        """Get numpy array YXC for entry."""
        data = entry.data_segment().data(resize=False)[
            tuple(
                [ 0 for d in range(len(entry.axes) - 3) ]
                + [ slice(None) for d in range(3) ]
            )
        ]
        if dtype != None:
            if data.dtype != dtype:
                # need to truncate or renormalize
                if data.dtype == np.uint16 and dtype == np.uint8:
                    if self._channel_ranges is not None:
                        v1 = self._channel_ranges[entry.start[self._C]][1]
                        data = (data.astype(np.float32) * (1./v1) * 255).astype(np.uint8)
                    else:
                        # truncate assuming full-range
                        data = (data / 256).astype(np.uint8)
                else:
                    assert False, 'unimplemented conversion %s -> %s' % (data.dtype, dtype)
                    
        return data

def array_to_jpeg(array, Y, X, jpegroot=None, quality=75):
    """Save pixel array to JPEG.  Needs work."""

    jpegname = '%d_%d.jpg' % (X, Y)
        
    if jpegroot:
        jpegname = "%s/%s" % (jpegroot, jpegname)

    dirname = os.path.dirname(jpegname)
    try:
        os.makedirs(dirname)
    except:
        # may already exist?
        pass

    if array.shape[2] == 1:
        # drop single-channel dimension for grayscale array?
        array = array[:,:,0]

    try:
        img = toimage(array)
        img.save(jpegname, quality=quality)
    except Exception, te:
        print te, array.shape, Y, X, jpegroot, quality
        raise te

def metadata_to_xml(meta, channelno, channeldir):
    color_argb = meta['channel'][channelno]['color']
    if color_argb is not None and color_argb[0] == '#' and len(color_argb[1:]) == 8:
        alpha = '%f' % (int(color_argb[1:3], 16) / 255.0)
        rgb = ' '.join([ '%f' % (int(c, 16) / 255.0) for c in re.findall('..', color_argb[3:]) ])
        colorstuff = """
    channelDefaultAlpha="%s"
    channelDefaultRGB="%s" """ % (alpha, rgb)
    else:
        colorstuff = ""

    mpps = meta['microns_per_pixel']
    extra_dims = set(mpps.keys()).difference(set(['X', 'Y', 'Z']))
    assert not extra_dims, extra_dims
    mpps = set([ v for k, v in mpps.items() if k in ['X', 'Y'] ])
    assert len(mpps) == 1, mpps
    pix_per_meter = 1.0 / (mpps.pop() * 1E-6)
        
    doc = \
"""<?xml version="1.0" encoding="UTF-8"?>
<IMAGE_PROPERTIES
    width="%(W)d"
    height="%(H)d"
    meterScaleInPixels="%(PPM)f"
    numTiles="%(NT)d"
    numImages="1"
    version="2.0"
    tileWidth="%(TW)d"
    tileHeight="%(TH)d"
    levelScale="2"
    minLevel="0"
    maxLevel="%(ML)d"
    channelName="%(CN)s"%(COLORSTUFF)s
    minValue="%(V0)s"
    maxValue="%(V1)s"
    data="%(P)s"
/>""" % dict(
    P=channeldir,
    CN=meta['channel'][channelno]['cname_long'],
    W=meta['canvas_size'][0],
    H=meta['canvas_size'][1],
    PPM=pix_per_meter,
    NT=meta['channel'][channelno]['ntiles'],
    TW=meta['tile_size'][0],
    TH=meta['tile_size'][1],
    ML=len(meta['channel'][channelno]['zooms'].keys()) - 1,
    COLORSTUFF=colorstuff,
    V0=(meta['channel'][channelno]['valuerange'][0] / 255.0),
    V1=(meta['channel'][channelno]['valuerange'][1] / 255.0),
)
    f = open('%s/ImageProperties.xml' % channeldir, 'w')
    f.write(doc)
    f.close()
    
def main(czifilename, dzidirname=None):
    """Convert CZI to DZI.  work in progress...
    
    """
    if dzidirname is None:
        assert czifilename[-4:] == '.czi'
        dzidirname = czifilename[0:-4] + '.dzi'

    renormalize = os.getenv('CZI_RENORMALIZE', 'f').lower() in ['t', 'true']
        
    converter = LazyCziConverter(czifilename, renormalize=renormalize)

    skip_existing = (os.getenv('DZI_SKIP_EXISTING') or '').lower() in ['t', 'true']

    tilesize = os.getenv('DZI_TILESIZE_YxX')
    if tilesize:
        tilesize = tuple([ int(s) for s in tilesize.split('x') ])
        assert len(tilesize) == 2
    else:
        tilesize = (512, 512)

    quality = os.getenv('DZI_JPEG_QUALITY')
    if quality:
        quality = int(quality)
    else:
        quality = 75
        
    H, W = converter.canvas_size()
    spp = converter._fo.shape[-1]
    doc = dict(channel=dict(), canvas_size=(W, H), tile_size=(tilesize[1], tilesize[0]), samples_per_pixel=spp, microns_per_pixel=converter.mpps)

    # map zoom levels to DZI zoom tier numbers
    zooms = list(converter._zoom_levels)
    zooms.sort(reverse=True)
    zoom_numbers = dict([ (zooms[i], i) for i in range(len(zooms)) ])
    
    for channel in range(converter.num_channels()):
        cname = converter._channel_names[channel]
        cname_long = converter._channel_names_long[channel]
        color = converter._channel_colors[channel]
        doc['channel'][channel] = dict(name=cname, zooms=dict(), ntiles=0, cname_long=cname_long, color=color)

        if cname == 'Brigh':
            fill = np.array([[[255,255,255]]], dtype=np.uint8)
        else:
            fill = None
            
        # TODO: use channel name or number here...?
        dzichanneldirname = "%s/%s" % (dzidirname, cname)

        pixel_range = [None, None]
        
        for zoom in converter._zoom_levels:
            H, W = map(lambda x: x/zoom, converter.canvas_size())
            K, J = map(lambda c, t: c/t + (c%t and 1 or 0), (H, W), tilesize)

            dzizoomdirname = "%s/%d" % (dzichanneldirname, zoom_numbers[zoom])
            
            sys.stderr.write('Channel %d zoom %d: Canvas %dx%d using %dx%d output grid of %dx%d q=%d tiles\n' % (
                channel, zoom, W, H, J, K, tilesize[1], tilesize[0], quality
            ))
            
            doc['channel'][channel]['zooms'][zoom] = dict(shape=(W, H), tile_grid=(J, K))
            doc['channel'][channel]['ntiles'] = doc['channel'][channel]['ntiles'] + K * J
                                                          
            for k in range(K):
                for j in range(J):
                    tile = converter.get_tile_data(
                        channel, zoom,
                        (
                            slice(k*tilesize[0], (k+1)*tilesize[0]),
                            slice(j*tilesize[1], (j+1)*tilesize[1]),
                        ),
                        fill=fill,
                        range_accum=pixel_range
                    )

                    if skip_existing and os.access('%s/%d_%d.jpg' % (dzizoomdirname, j, k), os.F_OK):
                        pass
                    else:
                        array_to_jpeg(tile, k, j, dzizoomdirname, quality)

        doc['channel'][channel]['valuerange'] = [ int(v) for v in pixel_range ]
        metadata_to_xml(doc, channel, dzichanneldirname)

    # dump overall info to JSON for now...
    f = open(dzidirname + '/info.json', 'w')
    json.dump(doc, f, indent=2)

def usage(mesg):
    return """%s
usage: czi2dzi.py czifile [dzidir]

This command converts one CZI file to one or more DZI pyramids in the
(optional) DZI target directory.  It creates one pyramid for each
separate CZI channel, e.g. a grayscale scientific channel.  An
interleaved RGB brightfield channel will produce an interleaved RGB
pyramid.

The dzidir destination defaults to a name derived from the CZI
filename if not specified.

""" % (mesg)
    
if __name__ == "__main__":
    if len(sys.argv) <= 1:
        raise ValueError(usage('First argument must be a CZI filepath.'))
    
    if len(sys.argv) > 3:
        raise ValueError(usage('At most two arguments are expected.'))
    
    try:
        f = open(sys.argv[1])
        try:
            fo = czifile.CziFile(sys.argv[1])
        except Exception, e:
            raise ValueError(usage('%s. First argument must be a DZI file.' % e))
    except:
        raise ValueError(usage('First argument must be a readable file.'))

    if len(sys.argv) > 2:
        if os.path.exists(sys.argv[2]):
            if not os.path.isdir(sys.argv[2]):
                raise ValueError(usage('Second argument must be non-existent or an existing directory.'))
        
    ret = main(*sys.argv[1:])
    sys.exit(ret)
