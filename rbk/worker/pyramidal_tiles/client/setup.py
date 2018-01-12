
#
# Copyright 2017 University of Southern California
# Distributed under the (new) BSD License. See LICENSE.txt for more info.
#

from distutils.core import setup

setup(
    name="rbk_pyramidal_tiles",
    description="Script for generating pyramidal tiles",
    version="0.1-prerelease",
    scripts=[
        "rbk_pyramidal_tiles.py",
    ],
    requires=["rbk_pyramidal_tiles_lib"],
    maintainer_email="support@misd.isi.edu",
    license='(new) BSD',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Science/Research',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: POSIX',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
    ])
