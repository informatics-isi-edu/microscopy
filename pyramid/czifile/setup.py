# setup.py
import sys
import os
from distutils.core import setup, Extension
from Cython.Distutils import build_ext
from czifile.czifile import __version__ as version
from czifile.czifile import __doc__ as long_description

jxrlib_dir = '/usr/lib64'
include_dirs = ['/usr/include/jxrlib']
include_dirs += [
    os.path.join(jxrlib_dir, *d.split('/'))
    for d in ('jxrgluelib', 'common/include', 'image/sys')
]
define_macros = [('INITGUID', None)]
ext = Extension(
    'czifile._czifile',
    sources=['czifile.pyx'],
    include_dirs=include_dirs,
    define_macros=define_macros,
    library_dirs=[jxrlib_dir],
    libraries=['jpegxr', 'jpeg', 'jxrglue'],
)
setup(
    name='czifile',
    version=version,
    # is this supposed to be the software author or package script author?
    author='Cristoph Gohlke', author_email='cgohlke@uci.edu',
    maintainer='Karl Czajkowski', maintainer_email='karlcz@isi.edu',
    description='Read image and metadata from Carl Zeiss(r) ZISRAW (CZI) files',
    long_description=long_description,
    license='BSD',
    packages=['czifile'],
    cmdclass={'build_ext': build_ext},
    ext_modules=[ext]
)

