
# Pyramidal File Converters


## czi2dzi.py

This script converts a CZI file to a set of DZI pyramids. Usage:

    czi2dzi.py czifile [dzidir]

The optional _dzidir_ parameter defaults to the named _czifile_
replacing the `.czi` suffix with `.dzi`.

### Prequisites

- Numpy
- Scipy
- jxrlib C library
- Czifile.py
- Czifile.pyx extension for JPEG-XR decoder
- Tifffile.py

