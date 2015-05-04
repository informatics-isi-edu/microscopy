# Microscopy Image Manager

## Installation Instructions

1. First install all prerequisites for ERMrest

   See https://github.com/informatics-isi-edu/ermrest

2. Install Globus Online Transfer Client API

   easy_install globusonline-transfer-api-client

3. Install printer and globuscli

   cd printer && sudo python setup.py install
   cd globuscli && sudo python setup.py install

4. Setup the database

   see config/README

5. Setup the rest services

   see rest/README

6. Install the webcli

   rsync -av --delete --exclude=".*" ./webcli /var/www/html/

7. Install Zoomify Viewer

   Note: You will need a licensed verison of the Zoomify HTML5 Viewer.
         For more information, go to www.zoomify.com

   You will need to copy over the ZoomifyImageViewer.js and the Assets/
   directory normally located in the same directory of the Zoomify
   distribution zip file.

   mkdir -p /var/www/html/webcli/zoomify
   cp /path/to/ZoomifyImageViewer /var/www/html/webcli/zoomify/
   cp -R /path/to/Assets /var/www/html/webcli/zoomify/

8. Restart httpd

   sudo service httpd restart
