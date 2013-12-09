# 
# Copyright 2012-2013 University of Southern California
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import web

_base_html = """
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>

        <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">

        <script type="text/javascript" src="../../cirm/zoomify/ZoomifyImageViewer.js"></script>
        <style type="text/css"> #myContainer { width:900px; height:550px; margin:auto; border:1px; border-style:solid; border-color:#696969;} </style>
        <script type="text/javascript"> Z.showImage("myContainer", "../../cirm/zoomify/%(scan_id)s", "zInitialZoom=50&zFullPageInitial=1&zLogoVisible=0&zSkinPath=../../cirm/zoomify/Assets/Skins/Default"); </script>

    </head>

    <body>

        <div id="myContainer"></div>

    </body>
</html>
"""

class Zoomify:
    
    def GET(self, scan_id):
        web.header("Content-Type", "text/html")
        return _base_html % (dict(scan_id=scan_id))