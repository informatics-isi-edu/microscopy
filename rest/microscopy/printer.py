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

class Printer:
    def __init__(self):
        self.uri = 'http://purl.org/usc-microscopy'
        self.CXI_RET = 'Return value'
        self.CXI_MSG = 'Return Message'
        
    def setPrinter(self, id, printer):
        self.printer_id, self.printer_port = printer
        if self.printers != None:
            if id=='specimen':
                self.printer_id, self.printer_port = (self.printers['box_addr'], self.printers['box_port'])
            elif id=='slide':
                self.printer_id, self.printer_port = (self.printers['slide_addr'], self.printers['slide_port'])
        if printer != (self.printer_id, self.printer_port):
            self.printer_id, self.printer_port = printer
        
class PrintControl (Printer):
    
    def __init__(self):
        Printer.__init__(self)
        
    def GET(self, printerID, param):
        printer = web.input()
        self.setPrinter(printerID, (printer['printer_id'], int(printer['printer_port'])))
        response = []
        try:
            if param == 'getStatus':
                res = cxi.utils.checkStatus(self.printer_id, self.printer_port)
            elif param == 'getConfiguration':
                res = cxi.utils.checkConfig(self.printer_id, self.printer_port)
        except:
            res = {}
            res[self.CXI_RET] = 0
            res[self.CXI_MSG] = 'Internal Server Error. The request execution encountered a runtime error.'
                    
        response.append(res)
        return json.dumps(response)
    
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
        
    def GET(self, entity, jobID):
        return "You want %s:%s\n" % (str(entity), str(jobID))
    
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
