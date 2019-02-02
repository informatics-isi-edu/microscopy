#!/usr/bin/env python3
#
# Copyright 2013-2014 University of Southern California
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

from .printer import *
import webauthn2

__all__ = [
    'printer'
    ]

## setup web service configuration data
global_env = webauthn2.merge_config(
    jsonFileName='ermrest_config.json',
    built_ins={
        "default_limit": 100,
        "db": "microscopy",
        "dbn": "postgres",
        "dbmaxconnections": 8
        }
    )

## setup webauthn2 handler
webauthn2_config = global_env.get('webauthn2', dict(web_cookie_name='ermrest'))
webauthn2_config.update(dict(web_cookie_path='/ermrest'))
webauthn2_manager = webauthn2.Manager(overrides=webauthn2_config)

## setup web urls
def web_urls():
    """Builds and returns the web_urls for web.py.
    """

    def printerClass(superClass, printers):
        class C (superClass):
            def __init__(self):
                self.printers = printers
                superClass.__init__(self)
        return C

    urls = (
        # print job and print control
        '/printer/([^/]+)/job', printerClass(printer.PrintJob, global_env.get('printers')),
        '/printer/([^/]+)/job/([^/]+)/', printerClass(printer.PrintJob, global_env.get('printers')),
        '/printer/([^/]+)/control/([^/]+)/', printerClass(printer.PrintControl, global_env.get('printers'))
    )

    return tuple(urls)
