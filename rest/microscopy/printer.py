# -*- coding: utf-8 -*-

# 
# Copyright 2012-2014 University of Southern California
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

import cStringIO
import web
import json
import cxi

html = '''
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
    <meta http-equiv="Pragma" content="no-cache"/>
    <meta http-equiv="Expires" content="0"/>
    <title>Microscopy</title>
    <link rel="stylesheet" type="text/css" href="/chaise/styles/vendor/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="/chaise/styles/ermrest.css">
    <link rel="stylesheet" type="text/css" href="/chaise/styles/app.css">
</head>
<body>
    <div class="sidebar-overlay"></div>
    <div id="main-wrapper" class="container">
        <div id="main-content" class="col-xs-6 col-sm-6 col-md-7 col-lg-8 col-xl-9">
            <navbar class="ng-isolate-scope">
                <header class="row" style="z-index: -1; margin-bottom: 70px;">
                    <nav id="mainnav" class="navbar navbar-fixed-top navbar-inverse" role="navigation">
                        <div class="container-fluid">
                            <div class="navbar-header">
                                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#fb-navbar-main-collapse">
                                    <span class="sr-only">Toggle navigation</span>
                                    <span class="md-chevron-down"></span>
                                    MENU
                                </button>
                                <a href="/" class="navbar-brand" ng-href="/">
                                    <span class="ng-binding" id="brand-text">Microscopy</span>
                                </a>
                            </div>
                        </div>
                    </nav>
                </header>
            </navbar>
            <div>
                <h1>%s</h1>
                <p>
                <blockquote>%s\n\t\t\t\t</blockquote>
            </div>
        </div>
    </div>
    <footer class="row footer">
        <div class="container">
            <p class="footer-text">© 2014-2016 University of Southern California</p>
        </div>
    </footer>
</body>
</html>
'''

class Printer:
    def __init__(self):
        self.uri = 'http://purl.org/usc-microscopy'
        self.CXI_RET = 'Return value'
        self.CXI_MSG = 'Return Message'
        
    def setPrinter(self, id, printer):
        if self.printers != None:
            if id.lower() == 'specimen':
                self.printer_id, self.printer_port = (self.printers['box_addr'], self.printers['box_port'])
            elif id.lower() == 'slide':
                self.printer_id, self.printer_port = (self.printers['slide_addr'], self.printers['slide_port'])
        
        printer_id, printer_port = printer
        
        if printer_id != None:
            self.printer_id = printer_id
        if printer_port != None:
            self.printer_port = printer_port
        
    def getHTML(self, command, res):
        message = ''
        for key in res.keys():
            message = '%s\n\t\t\t\t\t %s: %s<br/>' % (message, str(key), str(res[key]))
        return html % (command, message)
        
class PrintControl (Printer):
    
    def __init__(self):
        Printer.__init__(self)
        
    def GET(self, printerID, param):
        printer = web.input()
        printer_id = None
        printer_port = None
        try:
           printer_id = printer['printer_id']
        except:
            pass
           
        try:
           printer_port = int(printer['printer_port'])
        except:
            pass
           
        self.setPrinter(printerID, (printer_id, printer_port))
        response = []
        if printerID.lower() == 'specimen':
            command = 'Specimen'
        else:
            command = 'Slide'
        try:
            if param == 'getStatus':
                res = cxi.utils.checkStatus(self.printer_id, self.printer_port)
                command = '%s Printer Status' % command
            elif param == 'getConfiguration':
                res = cxi.utils.checkConfig(self.printer_id, self.printer_port)
                command = '%s Printer Configuration' % command
            elif param == 'checkConnection':
                res = cxi.utils.checkConnection(self.printer_id, self.printer_port)
                command = '%s Printer Connection' % command
        except:
            res = {}
            res[self.CXI_RET] = 0
            res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
                    
        response.append(res)
        #return json.dumps(response)
        web.header('Content-Type', 'text/html')
        return self.getHTML(command, res)
        
    
    def PUT(self, printerID, param):
        input_data = cStringIO.StringIO(web.ctx.env['wsgi.input'].read())
        json_data = json.load(input_data)
        printer = json_data[0]
        self.setPrinter(printerID, (printer['printer_id'], int(printer['printer_port'])))
        response = []
        try:
            if param == 'checkConnection':
                res = cxi.utils.checkConnection(self.printer_id, self.printer_port)
            elif param == 'resetPrinter':
                res = cxi.utils.resetCxi(self.printer_id, self.printer_port)
            elif param == 'calibratePrinter':
                res = cxi.utils.justCalibrate()
            elif param == 'forcePowerCycle':
                res = cxi.utils.cycleIt()
            elif param == 'shiftUp':
                res = cxi.utils.moveUp(self.printer_id, self.printer_port)
            elif param == 'shiftDown':
                res = cxi.utils.moveDown(self.printer_id, self.printer_port)
            elif param == 'shiftLeft':
                res = cxi.utils.moveLeft()
            elif param == 'shiftRight':
                res = cxi.utils.moveRight()
            elif param == 'testPrinter':
                res = cxi.utils.printTestSample()
            else:
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Unknown command: "%s".' % param
        except:
            res = {}
            res[self.CXI_RET] = 0
            res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
                    
        response.append(res)
        return json.dumps(response)
    
class PrintJob (Printer):
    
    def __init__(self):
        Printer.__init__(self)
        
    def GET(self, entity):
        self.setPrinter(entity, (None, None))
        params = web.input()
        response = []
        if entity.lower() == 'specimen':
            command = 'Print Specimen Label'
        else:
            command = 'Print Slide Label'
        if entity == 'specimen':
            id = params['ID']
            section_date = params['Section Date']
            sample_name = params['Sample Name']
            initials = params['Initials']
            disambiguator = params['Disambiguator']
            comment = params['Comment']
            try:
                res = cxi.utils.makeBoxLabel(self.printer_id, self.printer_port, section_date, sample_name, initials, disambiguator, self.uri, id, comment)
            except:
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
            response.append(res)
        elif entity == 'slide':
            id = params['ID']
            experiment = params['Experiment ID']
            experiment_date = params['Experiment Date']
            sample_name = params['Sample Name']
            experiment_description = params['Experiment Description']
            initials = params['Initials']
            sequence_num = params['Seq.']
            revision = 0
            try:
                res = cxi.utils.makeSliceLabel(self.printer_id, self.printer_port, experiment_date, sample_name, experiment_description, experiment, initials, sequence_num, revision, self.uri, id)
            except:
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
            response.append(res)
                    
        #return json.dumps(response)
        web.header('Content-Type', 'text/html')
        return self.getHTML(command, res)
    
    def POST(self, entity):
        response = []
        input_data = cStringIO.StringIO(web.ctx.env['wsgi.input'].read())
        json_data = json.load(input_data)
        if len(json_data) > 0:
            self.setPrinter(entity, (json_data[0]['printer_id'], json_data[0]['printer_port']))
        if entity == 'specimen':
            specimen = json_data[0]
            id = specimen['ID']
            section_date = specimen['Section Date']
            sample_name = specimen['Sample Name']
            initials = specimen['Initials']
            disambiguator = specimen['Disambiguator']
            comment = specimen['Comment']
            try:
                res = cxi.utils.makeBoxLabel(self.printer_id, self.printer_port, section_date, sample_name, initials, disambiguator, self.uri, id, comment)
            except:
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
            response.append(res)
        elif entity == 'slide':
            for slide in json_data:
                id = slide['ID']
                experiment = slide['Experiment']
                experiment_date = slide['Experiment Date']
                sample_name = slide['Sample Name']
                experiment_description = slide['Experiment Description']
                initials = slide['Initials']
                sequence_num = slide['Seq.']
                revision = slide['Rev.']
                try:
                    res = cxi.utils.makeSliceLabel(self.printer_id, self.printer_port, experiment_date, sample_name, experiment_description, experiment, initials, sequence_num, revision, self.uri, id)
                except:
                    res = {}
                    res[self.CXI_RET] = 0
                    res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
                if res[self.CXI_RET] <= 0:
                    break
            response.append(res)
                    
        return json.dumps(response)
