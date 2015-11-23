
# Pyramidal File Converters


## czi2dzi.py

This script converts a CZI file to a set of DZI pyramids. Usage:

    czi2dzi.py czifile [dzidir]

The optional _dzidir_ parameter defaults to the named _czifile_
replacing the `.czi` suffix with `.dzi`.

### Prequisites

These prerequisites should be installed to the system prior to using
the `czi2dzi.py` script:

- Numpy
- Scipy
- Cython
- JPEG C library
  - Such as `libjpeg-turbo` and `libjpeg-turbo-devel` on Fedora or CentOS.
- JPEG-XR C library
  - Such as `jxrlib` and `jxrlib-devel` on Fedora or Fedora EPEL.
- Czifile (see below)
- Tifffile (see below)

#### Czifile Package

The `czifile` sub-directory provides a packaged version of the
Czifile.py module needed by this script.  It can be installed via:

    cd czifile
    python ./setup.py install

This package depends on the `jxrlib` JPEG-XR decoding library and the
`tifffile` Python module.

#### Tifffile Package

The `tifffile` sub-directory provides a packaged version of the
Tifffile.py module needed by this script.  It can be installed via:

    cd tifffile
    python ./setup.py install

