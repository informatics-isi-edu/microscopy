#!/usr/bin/python3
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

from io import StringIO
import web
import json
import cxi
import sys
import traceback
import urllib

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

print_label_html = '''
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
        <table style="position: absolute; width: 100%%; height: 100%%;">
            <tbody>
                <tr>
                    <td height="35" style="text-align: center;">%s</td>
                </tr>
                <tr>
                    <td height="20" style="vertical-align: bottom; padding-top: 2%%; padding-bottom: 0%%;">
                        <a class="btn btn-primary" style="display: block;" href="/chaise/PrintLabel.html?label=/microscopy/printer/%s/job?%s">OK</a>
                    </td>
                </tr>
            </tbody>
        </table>
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
        
    def getPrintLabelHTML(self, res, entity_type, label):
        message = res[self.CXI_MSG]
        #for key in res.keys():
        #    message = '%s%s: %s<br/>' % (message, str(key), str(res[key]))
        return print_label_html % (message, entity_type, label)
        
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
        input_data = StringIO(web.ctx.env['wsgi.input'].read())
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
        #web.debug(params)
        response = []
        label = []
        if entity.lower() == 'specimen':
            command = 'Print Specimen Label'
            entity_type = 'specimen'
        else:
            command = 'Print Slide Label'
            entity_type = 'slide'
        if entity == 'specimen':
            id = params['ID'].encode('utf8')
            section_date = params['Section Date'].encode('utf8')
            sample_name = params['Sample Name'].encode('utf8')
            initials = params['Initials'].encode('utf8')
            disambiguator = params['Disambiguator'].encode('utf8')
            comment = params['Comment'].encode('utf8')
            label.append('%s=%s' % (urllib.parse.quote('ID', safe=''), urllib.parse.quote(id, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Section Date', safe=''), urllib.parse.quote(section_date, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Sample Name', safe=''), urllib.parse.quote(sample_name, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Initials', safe=''), urllib.parse.quote(initials, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Disambiguator', safe=''), urllib.parse.quote(disambiguator, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Comment', safe=''), urllib.parse.quote(comment, safe='')))
            try:
                #res = {'Return value': 0, 'Return Message': 'Success (Test)'}
                res = cxi.utils.makeBoxLabel(self.printer_id, self.printer_port, params['Section Date'], params['Sample Name'], params['Initials'], params['Disambiguator'], self.uri, params['ID'], params['Comment'])
            except:
                et, ev, tb = sys.exc_info()
                web.debug('%s' % str(traceback.format_exception(et, ev, tb)))
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
            response.append(res)
        elif entity == 'slide':
            id = params['ID'].encode('utf8')
            experiment = params['Experiment ID'].encode('utf8')
            experiment_date = params['Experiment Date'].encode('utf8')
            sample_name = params['Sample Name'].encode('utf8')
            experiment_description = params['Experiment Description'].encode('utf8')
            initials = params['Initials'].encode('utf8')
            sequence_num = int(params['Seq.'])
            revision = 0
            label.append('%s=%s' % (urllib.parse.quote('ID', safe=''), urllib.parse.quote(id, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Experiment ID', safe=''), urllib.parse.quote(experiment, safe='')))
            label.append('%s=%d' % (urllib.parse.quote('Seq.', safe=''), sequence_num))
            label.append('%s=%s' % (urllib.parse.quote('Experiment Date', safe=''), urllib.parse.quote(experiment_date, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Sample Name', safe=''), urllib.parse.quote(sample_name, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Experiment Description', safe=''), urllib.parse.quote(experiment_description, safe='')))
            label.append('%s=%s' % (urllib.parse.quote('Initials', safe=''), urllib.parse.quote(initials, safe='')))
            try:
                #res = {'Return value': 0, 'Return Message': 'Success (Test)'}
                res = cxi.utils.makeSliceLabel(self.printer_id, self.printer_port, params['Experiment Date'], params['Sample Name'], params['Experiment Description'], params['Experiment ID'], params['Initials'], sequence_num, revision, self.uri, params['ID'])
            except:
                et, ev, tb = sys.exc_info()
                web.debug('%s' % str(traceback.format_exception(et, ev, tb)))
                res = {}
                res[self.CXI_RET] = 0
                res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
            response.append(res)
                    
        #return json.dumps(response)
        web.header('Content-Type', 'text/html')
        return self.getPrintLabelHTML(res, entity_type, '&'.join(label))
    
    def POST(self, entity):
        response = []
        input_data = StringIO(web.ctx.env['wsgi.input'].read())
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
