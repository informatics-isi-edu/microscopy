
# Pyramidal File Converters


## czi2dzi.py

This script converts a CZI file to a set of DZI pyramids. Usage:

    czi2dzi.py czifile [dzidir]

The optional _dzidir_ parameter defaults to the named _czifile_
replacing the `.czi` suffix with `.dzi`. This name is also encoded
into the resulting `ImageProperties.xml` at the top of each output
pyramid. Using an appropriate relative path for _dzidir_ may allow
this XML file to be used unmodified in your web server.

### Czi2Dzi Prequisites

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

### Czi2Dzi Installation

After installing prerequisites:

    cd czi2dzi
    python ./setup.py install

Now the executable script `czi2dzi.py` should be available in the
application PATH on the system.

