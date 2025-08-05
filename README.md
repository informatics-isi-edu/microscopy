# Microscopy Image Manager (🚫 Deprecated)
[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

This repository is no longer supported. Please consider using [DERIVA](https://derivacloud.org) 
for scientific data management.

## Introduction

The Microscopy Image Manger is a proof of concept solution for microscopy
image management based on the EMRrest service and IObox tools.

## Installation Instructions

1. Install ERMrest

   See https://github.com/informatics-isi-edu/ermrest

   Use the `master` branch rather than releases.

2. Install Globus Online Transfer Client API

   ```
   sudo easy_install globusonline-transfer-api-client
   ```

3. Install and setup the additional REST services

   See [REST services documentation](rest/README.md).

4. Install printer services

   ```
   cd printer && sudo python setup.py install
   ```

5. Setup the database

   See [configuration guide](config/README.md).

6. Install the webcli

   ```
   rsync -av --delete --exclude=".*" ./webcli /var/www/html/
   ```

7. Install Zoomify Viewer

   Note: You will need a licensed verison of the Zoomify HTML5 Viewer. For
   more information, visit the [Zoomify website](http://www.zoomify.com).

   You will need to copy over the `ZoomifyImageViewer.js` and the
   `Assets/` directory normally located in the same directory of the
   Zoomify distribution zip file.

   ```
   mkdir -p /var/www/html/webcli/zoomify
   cp /path/to/ZoomifyImageViewer /var/www/html/webcli/zoomify/
   cp -R /path/to/Assets /var/www/html/webcli/zoomify/
   ```

8. Restart httpd

   ```
   sudo service httpd restart
   ```

## License

MIM is made available as open source under the Apache License, Version 2.0.
Please see the LICENSE file for more information.
