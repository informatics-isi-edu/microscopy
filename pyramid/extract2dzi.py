#!/usr/bin/env python

import sys
import os
import math
from PIL import Image
from StringIO import StringIO

# you need to install this library yourself
# recent versions handle bigtiff too...
import tifffile

"""
Extract a pyramidal TIFF with JPEG tiled storage into a tree of
separate JPEG files into DZI compliant directory that is usable 
by openseadragon.

usage: extract2dzi.py pyramid-file dest-dir
         
The pyramid-file must be a multi-page TIFF with each page having an
image scaled by 1/2 from the previous page.  All pages must be tiled
with the same tile size, and tiles must be stored using the new-style
JPEG compression format, i.e. TIFF compression == 7.

The lowest resolution page must have 4 or fewer tiles.  If it has
more than 1, this script will leave space for the user to decide whether
final lowest zoom tile 0/0_0.jpg that is 1/2 scaled version of the image 
represented by that last page should be generated or not.

File directory generated
   
    dest-dir
      ImageProperties.xml
      pyramid.dzi
      0 
        0_0.jpg
      1
        0_0.jpg
        1_0.jpg
      ...

Since the tiled tiff kept padded tiles and openseadragon expected its
jpeg files to be cropped but not padded, the border tiles are cropped
and the width and height of image uses the actual image dimension
"""

try:
    fname = sys.argv[1]
    outdir = sys.argv[2]

    infile = open(fname, 'rb')
    if not os.path.exists(outdir):
        os.makedirs(outdir)
except:
    sys.stderr.write('\nusage: extract2dzi.py pyramid-file dest-dir\n\n')
    raise

t=fname.rsplit('/',1);
dzi_name=t[-1].replace('.tif','.dzi');

topdir_template = '%(outdir)s'
dir_template = topdir_template +'/%(zoomno)d'
tile_template = dir_template + '/%(tcolno)d_%(trowno)d.jpg'
dzi_template = '%(outdir)s/%(dzi_name)s'
image_template = '%(outdir)s/ImageProperties.xml'

tiff = tifffile.TiffFile(fname)
pages = list(tiff)

outinfo = []

# we need to go from lowest to highest zoom level
pages.reverse()

# skip pages that aren't tiled... thumbnails?!
outpages = [ page for page in pages if hasattr(page.tags, 'tile_offsets') ]
if type(outpages[0].tags.tile_offsets.value) is int:
    outpages[0].tags.tile_offsets.value=[outpages[0].tags.tile_offsets.value]
    outpages[0].tags.tile_byte_counts.value=[outpages[0].tags.tile_byte_counts.value]

## DEBUG print outpages[0].tags

zoomno = 0
lowest_level = 0
total_tiles = 0

# remember values for debugging sanity checks
prev_page = None
tile_width = None
tile_length = None
reduce_ratio = 2  # DZI default

################# helper functions ###################
# http://www.w3.org/Graphics/JPEG/jfif3.pdf
def jpeg_assemble(jpeg_tables_bytes, jpeg_bytes):
    return jpeg_bytes[0:2] + jpeg_tables_bytes + jpeg_bytes[2:]

def load_tile(tile_offset, tile_length):
    infile.seek(tile_offset)
    return infile.read(tile_length)

def dump_tile(tileno, trow, trows, tcol, tcols, jpeg_tables_bytes, tile_offset, tile_length):
    """Output one tile.  Note this manages global state for tile grouping in subdirs."""
    global zoomno
    global total_tiles

    cropIt = False
    if (trow+1 == trows) or (tcol+1 == tcols) : 
        #this is a border tile, crop it if need to
        if tcol+1 == tcols :
           cpxsize= (pxsize-(txsize * tcol))
        else:
           cpxsize=txsize
        if trow+1 == trows :
           cpysize= (pysize-(tysize * trow))
        else:
           cpysize=tysize
        cropIt = True
    
    total_tiles += 1

    topdir = topdir_template % dict(
        outdir = outdir
    )
    if not os.path.exists(topdir):
        os.makedirs(topdir, mode=0755)

    dirname = dir_template % dict(
        outdir = outdir,
        zoomno = zoomno
        )

    if not os.path.exists(dirname):
        # create tile group dir on demand
        os.makedirs(dirname, mode=0755)

    outname = tile_template % dict(
        outdir = outdir,
        zoomno = zoomno,
        tcolno = tcol,
        trowno = trow
        )
    
    data= jpeg_assemble(jpeg_tables_bytes, load_tile(tile_offset, tile_length));
    image = Image.open(StringIO(data))
    if cropIt :
        image = image.crop((0,0, cpxsize, cpysize))
    image.save(outname, 'JPEG')
    return outname

def get_page_info(page):

    pxsize = page.tags.image_width.value
    pysize = page.tags.image_length.value

    # get common JPEG tables to insert into all tiles
    # ffd8 ffdb .... ffd9
    if hasattr(page.tags, 'jpeg_tables'):
        # trim off start-image/end-image byte markers at prefix and suffix
        jpeg_tables_bytes = bytes(bytearray(page.tags.jpeg_tables.value))[2:-2]
    else:
        # no common tables to insert?
        jpeg_tables_bytes = bytes(bytearray([]))

    # this page has multiple JPEG tiles
    txsize = page.tags.tile_width.value
    tysize = page.tags.tile_length.value

    tcols = pxsize / txsize + (pxsize % txsize > 0)
    trows = pysize / tysize + (pysize % tysize > 0)


    return pxsize, pysize, txsize, tysize, tcols, trows, jpeg_tables_bytes
######################################################

for page in outpages:
    # panic if these change from reverse-engineered samples
    assert page.tags.fill_order.value == 1
    assert page.tags.orientation.value == 1
    assert page.tags.compression.value == 7 # new-style JPEG

    if prev_page is not None:
      reduce_ratio=page.tags.image_width.value / prev_page.tags.image_width.value

    pxsize, pysize, txsize, tysize, tcols, trows, jpeg_tables_bytes = get_page_info(page)
    
    for tileno in range(0, len(page.tags.tile_offsets.value)):
        # figure position of tile within tile array
        trow = tileno / tcols
        tcol = tileno % tcols

        assert trow >= 0 and trow < trows
        assert tcol >= 0 and tcol < tcols

        outname = dump_tile(
                  tileno, 
                  trow, trows,
                  tcol, tcols,
                  jpeg_tables_bytes, 
                  page.tags.tile_offsets.value[tileno],
                  page.tags.tile_byte_counts.value[tileno])

    if tile_width is not None:
        assert tile_width == txsize
        assert tile_length == tysize
    else:
        tile_width = txsize
        tile_length = tysize

    outinfo.append(
        dict(
            tile_width= txsize,
            tile_length= tysize,
            image_width_orig= pxsize,
            image_length_orig= pysize,
            image_width_padded= tcols * txsize,
            image_length_padded= trows * tysize,
            image_level = zoomno,
            total_tile_count= total_tiles,
            color_type = 'unknown',
            level_scale=reduce_ratio
            )
    )

    # each page is next higher zoom level
    zoomno += 1
    prev_page = page

infile.close()

imageinfo=outinfo[-1]

dzi_descriptor = """\
<?xml version="1.0" encoding="UTF-8"?>
<Image TileWidth="%(tile_width)d" 
       TileHeight="%(tile_length)d" 
       Overlap="1" 
       Format="jpg" 
       xmlns="http://schemas.microsoft.com/deepzoom/2008">
       <Size Width="%(image_width_orig)d" Height="%(image_length_orig)d"/>
</Image>
""" % imageinfo
dname= dzi_template % dict(outdir = outdir, dzi_name=dzi_name)
f = open('%s' % dname, 'w')
f.write(dzi_descriptor)
f.close

imageinfo['image_lowest_level']=lowest_level
imageinfo['data_location']=outdir;

image_descriptor = """\
<?xml version="1.0" encoding="UTF-8"?>
<IMAGE_PROPERTIES
                  WIDTH="%(image_width_orig)d" 
                  HEIGHT="%(image_length_orig)d" 
                  NUMTILES="%(total_tile_count)d" 
                  NUMIMAGES="1" 
                  VERSION="2.0" 
                  TILEWIDTH="%(tile_width)d" 
                  TILEHEIGHT="%(tile_length)d" 
                  LEVELSCALE="%(level_scale)d"
                  MINLEVEL="%(image_lowest_level)d" 
                  MAXLEVEL="%(image_level)d" 
                  CHANNELNAME="%(color_type)s" 
                  DATA="%(data_location)s"
/>
""" % imageinfo

iname= image_template % dict(outdir = outdir)
f = open('%s' % iname, 'w')
f.write(image_descriptor)
f.close

