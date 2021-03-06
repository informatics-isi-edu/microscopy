
#
# Copyright 2017 University of Southern California
# Distributed under the (new) BSD License. See LICENSE.txt for more info.
#

from distutils.core import setup

setup(
    name="rbk_delete_hatrac",
    description="Script for deleting a file from hatrac",
    version="0.1-prerelease",
    scripts=[
        "rbk_delete_hatrac.py",
    ],
    requires=["rbk_delete_hatrac_lib"],
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
