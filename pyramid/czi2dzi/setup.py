
#
# Copyright 2015 University of Southern California
# Distributed under the (new) BSD License. See LICENSE.txt for more info.
#

from distutils.core import setup

setup(
    name="czi2dzi",
    description="CZI to DZI pyramidal tile converter",
    version="0.1-prerelease",
    scripts=[
        "czi2dzi.py",
    ],
    requires=["numpy", "scipy", "tifffile", "czifile"],
    maintainer_email="support@misd.isi.edu",
    license='(new) BSD',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Science/Research',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: POSIX',
        'Programming Language :: Python :: 3',
    ])
