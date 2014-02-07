# 
# Copyright 2014 University of Southern California
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
from globusonline.transfer import api_client
from datetime import datetime, timedelta
import json
import sys
import traceback

class GlobusClient:

    def __init__(self):
        self.args = ['transfer.py']
        
    def POST(self):
        # get the transfer parameters
        input_data = cStringIO.StringIO(web.ctx.env['wsgi.input'].read())
        json_data = json.load(input_data)
        response = []
        user = json_data['user']
        token = json_data['token']
        endpoint_1 = json_data['endpoint_1']
        endpoint_2 = json_data['endpoint_2']
        label = None
        if 'label' in json_data:
            label = json_data['label']
        
        # create the client
        self.args = ['transfer.py']
        self.args.append(user)
        self.args.append('-g')
        self.args.append(token)

        try:
            api, _ = api_client.create_client_from_args(self.args)
            
            # check information about endpoints
            code, reason, data = api.endpoint(endpoint_1)
            code, reason, data = api.endpoint(endpoint_2)
            
            # activate endpoint
            code, reason, result = api.endpoint_autoactivate(endpoint_1, if_expires_in=600)
            code, reason, result = api.endpoint_autoactivate(endpoint_2, if_expires_in=600)
            
            # look at contents of endpoint
            code, reason, data = api.endpoint_ls(endpoint_1, '/')
            code, reason, data = api.endpoint_ls(endpoint_2, '/')
            
            # start transfer
            code, message, data = api.transfer_submission_id()
            t = api_client.Transfer(data['value'], endpoint_1, endpoint_2, deadline=datetime.utcnow() + timedelta(minutes=10), label=label)
            
            files = json_data['files']
            for item in files:
                file_from = item['file_from']
                file_to = item['file_to']
                t.add_item(file_from, file_to)
                
            code, reason, data = api.transfer(t)
            task_id = data['task_id']
            res = {}
            res['task_id'] = task_id
        except Exception, e:
            et, ev, tb = sys.exc_info()
            web.debug('got transfer exception "%s"' % str(ev), traceback.format_exception(et, ev, tb))
            res = {}
            res['error'] = e.message
            
        response.append(res)
        return json.dumps(response)
    
    