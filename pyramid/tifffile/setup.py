# setup.py
from distutils.core import setup, Extension
import numpy
from tifffile.tifffile import __version__ as version
from tifffile.tifffile import __doc__ as long_description

ext1 = Extension(
    'tifffile._tifffile',
    sources=['tifffile.c'],
    include_dirs=[numpy.get_include()]
)

setup(
    name='tifffile',
    version=version,
    # is this supposed to be the software author or package script author?
    author='Cristoph Gohlke', author_email='cgohlke@uci.edu',
    maintainer='Karl Czajkowski', maintainer_email='karlcz@isi.edu',
    description='Read image and meta data from (bio)TIFF files. Save numpy arrays as TIFF',
    long_description=long_description,
    license='BSD',
    packages=['tifffile'],
    ext_modules=[ext1]
)
