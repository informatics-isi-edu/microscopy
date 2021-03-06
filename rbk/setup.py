
#
# Copyright 2015 University of Southern California
# Distributed under the (new) BSD License. See LICENSE.txt for more info.
#

from distutils.core import setup

setup(
    name="RBK Workers",
    description="RBK/GUDMAP video",
    version="0.1-prerelease",
    scripts=[
        "bin/rbk_upload_youtube_worker",
        "bin/rbk_delete_hatrac_worker",
        "bin/rbk_delete_youtube_worker",
        "bin/rbk_pyramidal_tiles_worker"
    ],
    requires=['os',
        'sys',
        'logging',
        'deriva'],
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
