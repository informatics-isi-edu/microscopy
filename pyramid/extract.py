
import sys
import os
import json

# you need to install this library yourself
# recent versions handle bigtiff too...
import tifffile

"""
Extract a pyramidal TIFF with JPEG tiled storage into a tree of
separate JPEG files as expected by Zoomify.

usage: extract.py pyramid-file dest-dir

The pyramid-file must be a multi-page TIFF with each page having an
image scaled by 1/2 from the previous page.  All pages must be tiled
with the same tile size, and tiles must be stored using the new-style
JPEG compression format, i.e. TIFF compression == 7.

If the lowest resolution page must have 4 or fewer tiles.  If it has
more than 1, this script will leave space for the user to manually
generate the final lowest zoom tile 0-0-0.jpg that is 1/2 scaled
version of the image represented by that last page.

"""

try:
    fname = sys.argv[1]
    outdir = sys.argv[2]

    infile = open(fname, 'rb')
    if not os.path.exists(outdir):
        os.makedirs(outdir)
except:
    sys.stderr.write('\nusage: extract.py pyramid-file dest-dir\n\n')
    raise

dir_template = '%(outdir)s/TileGroup%(groupno)d'
tile_template = dir_template + '/%(zoomno)d-%(tcolno)d-%(trowno)d.jpg'
info_template = '%(outdir)s/image_info.json'

tiff = tifffile.TiffFile(fname)
pages = list(tiff)

# we need to go from lowest to highest zoom level
pages.reverse()

tile_group = 0
tiles_per_group = 256

# skip pages that aren't tiled... thumbnails?!
outpages = [ page for page in pages if hasattr(page.tags, 'tile_offsets') ]

if hasattr(outpages[0].tags, 'tile_offsets') and len(outpages[0].tags.tile_offsets.value) > 1:
    # first input zoom level is multi-tile
    assert len(outpages[0].tags.tile_offsets.value) <= 4

    # so leave space for tile 0-0-0
    zoomno = 1
    group_file_count = 1
    total_tiles = 1

    # TODO: compute this tile automatically?
else:
    # input includes first zoom level already
    zoomno = 0
    group_file_count = 0
    total_tiles = 0

# remember values for debugging sanity checks
prev_page = None
tile_width = None
tile_length = None

def dump_tile(tileno, trow, tcol, jpeg_tables_bytes, tile_offset, tile_length):
    """Output one tile.  Note this manages global state for tile grouping in subdirs."""
    global group_file_count
    global zoomno
    global tile_group
    global total_tiles

    if group_file_count >= tiles_per_group:
        # last group is full already
        tile_group += 1
        group_file_count = 0

    group_file_count += 1
    total_tiles += 1

    dirname = dir_template % dict(
        outdir = outdir,
        groupno = tile_group
        )

    if not os.path.exists(dirname):
        # create tile group dir on demand
        os.makedirs(dirname, mode=0755)

    infile.seek(tile_offset)
    buf = infile.read(tile_length)

    outname = tile_template % dict(
        outdir = outdir,
        groupno = tile_group,
        zoomno = zoomno,
        tcolno = tcol,
        trowno = trow
        )
    
    outfile = open(outname, 'wb')
    # assemble JPEG from tile abbreviated jpeg and shared table bytes
    outfile.write( buf[0:2] )            # start-image marker
    outfile.write( jpeg_tables_bytes )   # common tables
    outfile.write( buf[2:] )             # end-image marker
    outfile.close()

outinfo = []

for page in outpages:
    # panic if these change from reverse-engineered samples
    assert page.tags.fill_order.value == 1
    assert page.tags.orientation.value == 1
    assert page.tags.compression.value == 7 # new-style JPEG

    if prev_page is not None:
        assert prev_page.tags.image_width.value == (page.tags.image_width.value / 2)
        assert prev_page.tags.image_length.value == (page.tags.image_length.value / 2)

    # find shape of tile array
    pxsize = page.tags.image_width.value
    pysize = page.tags.image_length.value

    # get common JPEG tables to insert into all tiles
    if hasattr(page.tags, 'jpeg_tables'):
        # trim off start-image/end-image byte markers at prefix and suffix
        jpeg_tables_bytes = bytes(bytearray(page.tags.jpeg_tables.value))[2:-3]
    else:
        # no common tables to insert?
        jpeg_tables_bytes = bytes(bytearray([]))

    # this page has multiple JPEG tiles
    txsize = page.tags.tile_width.value
    tysize = page.tags.tile_length.value

    tcols = pxsize / txsize + (pxsize % txsize > 0)
    trows = pysize / tysize + (pysize % tysize > 0)
    
    for tileno in range(0, len(page.tags.tile_offsets.value)):

        # figure position of tile within tile array
        trow = tileno / tcols
        tcol = tileno % tcols

        assert trow >= 0 and trow < trows
        assert tcol >= 0 and tcol < tcols

        dump_tile(tileno, trow, tcol, jpeg_tables_bytes, page.tags.tile_offsets.value[tileno], page.tags.tile_byte_counts.value[tileno])
    
    if tile_width is not None:
        assert tile_width == txsize
        assert tile_height == tysize
    else:
        tile_width = txsize
        tile_height = tysize

    # each page is next higher zoom level
    zoomno += 1
    prev_page = page

    outinfo.append(
        dict(
            tile_width= txsize,
            tile_length= tysize,
            image_width_orig= pxsize,
            image_length_orig= pysize,
            image_width_padded= tcols * txsize,
            image_length_padded= trows * tysize,
            total_tile_count= total_tiles
            )
        )

infile.close()


# TODO: generate zoomify XML parameter file based on pages[-1] info
# note: round up image sizes to tile aligned values?

infofile = open( info_template % dict(outdir=outdir), 'w' )
json.dump(outinfo[-1], infofile, indent=2)
infofile.write('\n')
infofile.close()

