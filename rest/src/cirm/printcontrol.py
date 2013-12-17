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

import cStringIO
import web
import json
import cxi

class PrintControl:
    
    def __init__(self):
        self.uri = 'http://purl.org/usc-cirm'
        self.CXI_RET='Return value'
        self.CXI_MSG='Return Message'
        
    def GET(self, printerID, param):
        printer = web.input()
        printer_id = printer['printer_id']
        printer_port = printer['printer_port']
        response = []
        try:
            if param == 'getStatus':
                res = cxi.utils.checkStatus(printer_id, printer_port)
            elif param == 'getConfiguration':
                res = cxi.utils.checkConfig()
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
        printer_id = printer['printer_id']
        printer_port = printer['printer_port']
        response = []
        try:
            if param == 'checkConnection':
                res = cxi.utils.checkConnection(printer_id, printer_port)
            elif param == 'resetPrinter':
                res = cxi.utils.resetCxi(printer_id, printer_port)
            elif param == 'calibratePrinter':
                res = cxi.utils.justCalibrate()
            elif param == 'forcePowerCycle':
                res = cxi.utils.cycleIt()
            elif param == 'shiftUp':
                res = cxi.utils.moveUp(printer_id, printer_port)
            elif param == 'shiftDown':
                res = cxi.utils.moveDown(printer_id, printer_port)
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
    