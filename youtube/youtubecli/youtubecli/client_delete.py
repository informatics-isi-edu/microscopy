#!/usr/bin/python
# 
# Copyright 2017 University of Southern California
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
"""
YouTube Client for deleting a video.
"""

import os
import sys
import traceback

import google.oauth2.credentials

import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow
from oauth2client.file import Storage

SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'

class ClientDeleteYouTubeVideo (object):
    """
    Delete client for YouTube.
    """
    ## Derived from the ermrest iobox service client

    def __init__(self, **kwargs):
        self.client_secrets_file = kwargs.get("client_secrets_file")
        self.client_oauth2_file = kwargs.get("client_oauth2_file")
        self.logger = kwargs.get("logger")
        self.logger.debug('ClientDeleteYouTubeVideo initialized.')

    """
    Get the YouTube Delete credentials
    """
    def youtube_authenticated_service(self):
        flow = InstalledAppFlow.from_client_secrets_file(self.client_secrets_file, SCOPES)
        storage = Storage(self.client_oauth2_file)
        credentials = storage.get()
        if credentials is None or credentials.invalid:
            credentials = flow.run_console()
        self.youtube = build(API_SERVICE_NAME, API_VERSION, credentials = credentials)

    """
    Delete a video from YouTube
    """
    def youtube_delete(self, youtube_uri):
        res = False
        try:
            id = youtube_uri[youtube_uri.rfind('/')+1:youtube_uri.index('?')]
            self.logger.debug('Deleting YouTube video id="%s".' % (id)) 
            self.youtube_authenticated_service()
            if self.youtube is not None:
                self.logger.debug('Authenticated to the YouTube delete service.')
                response = self.youtube.videos().delete(id=id).execute()
                self.logger.debug('Deleted response %s.' % (response)) 
                res = True
            else:
                self.logger.debug('Authentication for deleting a YouTube video failed.') 
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got YouTube exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            
        return res
        
        
