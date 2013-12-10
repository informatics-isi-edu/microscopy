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

class PrintJob:
    
    def __init__(self):
        self.uri = 'http://purl.org/usc-cirm'
        
    def GET(self, printerID, jobID):
        return "You want %s:%s\n" % (str(printerID), str(jobID))
    
    def POST(self, printerID):
        response = []
        input_data = cStringIO.StringIO(web.ctx.env['wsgi.input'].read())
        json_data = json.load(input_data)
        result = 'success'
        if printerID == 'box':
            box = json_data[0]
            id = box['id']
            section_date = box['section_date']
            sample_name = box['sample_name']
            initials = box['initials']
            disambiguator = box['disambiguator']
            comment = box['comment']
            res = cxi.utils.makeBoxLabel(section_date, sample_name, initials, disambiguator, self.uri, id, comment)
            if res == 0:
                result = 'failure'
            val = {}
            val['result'] = result
            response.append(val)
        elif printerID == 'slide':
            for slide in json_data:
                id = slide['id']
                experiment = slide['experiment']
                experiment_date = slide['experiment_date']
                sample_name = slide['sample_name']
                experiment_description = slide['experiment_description']
                initials = slide['initials']
                sequence_num = slide['sequence_num']
                revision = slide['revision']
                id = cxi.utils.makeSliceLabel(experiment_date, sample_name, experiment_description, experiment, initials, sequence_num, revision, self.uri, id)
                if res == 0:
                    result = 'failure'
                val = {}
                val['result'] = result
                response.append(val)
                    
        return json.dumps(response)
    