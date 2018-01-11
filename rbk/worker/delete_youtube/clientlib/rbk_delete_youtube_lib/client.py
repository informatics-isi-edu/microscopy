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
Client for deleting videos from YouTube.
"""

import os
import json
import urlparse
import sys
import traceback
import time
import smtplib
from email.mime.text import MIMEText
import socket

from deriva.core import PollingErmrestCatalog, urlquote

mail_footer = 'Do not reply to this message.  This is an automated message generated by the system, which does not receive email messages.'

import google.oauth2.credentials

import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow
from oauth2client.file import Storage

SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'

mail_footer = 'Do not reply to this message.  This is an automated message generated by the system, which does not receive email messages.'

class YouTubeClient (object):
    """
    Network client for YouTube.
    """
    ## Derived from the ermrest iobox service client

    def __init__(self, **kwargs):
        self.baseuri = kwargs.get("baseuri")
        o = urlparse.urlparse(self.baseuri)
        self.scheme = o[0]
        host_port = o[1].split(":")
        self.host = host_port[0]
        self.path = o.path
        self.port = None
        if len(host_port) > 1:
            self.port = host_port[1]
        self.cookie = kwargs.get("cookie")
        self.client_secrets_file = kwargs.get("client_secrets_file")
        self.client_oauth2_file = kwargs.get("client_oauth2_file")
        self.catalog = PollingErmrestCatalog(
            self.scheme, 
            self.host,
            self.path.split('/')[-1],
            {'cookie': self.cookie}
        )
        self.mail_server = kwargs.get("mail_server")
        self.mail_sender = kwargs.get("mail_sender")
        self.mail_receiver = kwargs.get("mail_receiver")
        self.logger = kwargs.get("logger")
        self.logger.debug('Delete YouTube Client initialized.')

    """
    Send email notification
    """
    def sendMail(self, subject, text):
        if self.mail_server and self.mail_sender and self.mail_receiver:
            retry = 0
            ready = False
            while not ready:
                try:
                    msg = MIMEText('%s\n\n%s' % (text, mail_footer), 'plain')
                    msg['Subject'] = subject
                    msg['From'] = self.mail_sender
                    msg['To'] = self.mail_receiver
                    s = smtplib.SMTP(self.mail_server)
                    s.sendmail(self.mail_sender, self.mail_receiver.split(','), msg.as_string())
                    s.quit()
                    self.logger.debug('Sent email notification.')
                    ready = True
                except socket.gaierror as e:
                    if e.errno == socket.EAI_AGAIN:
                        time.sleep(100)
                        retry = retry + 1
                        ready = retry > 10
                    else:
                        ready = True
                    if ready:
                        et, ev, tb = sys.exc_info()
                        self.logger.error('got exception "%s"' % str(ev))
                        self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                except:
                    et, ev, tb = sys.exc_info()
                    self.logger.error('got exception "%s"' % str(ev))
                    self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                    ready = True

    """
    Start the process for deleting files from YouTube
    """
    def start(self):
        try:
            self.deleteFromYouTube()
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE Delete YouTube: unexpected exception', '%s\nThe process might have been stopped\n' % str(traceback.format_exception(et, ev, tb)))
            raise
        
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
        
    """
    Delete videos from YouTube
    """
    def deleteFromYouTube(self):
        url = '/entity/Common:Delete_Youtube/Youtube_Deleted=FALSE/Processing_Status=in%20progress;Processing_Status::null::' 
        resp = self.catalog.get(url)
        resp.raise_for_status()
        files = resp.json()
        fileids = []
        for f in files:
            fileids.append((f['YouTube_URI'], f['RID']))
                
        self.logger.debug('Deleting from YouTube %d videos(s).' % (len(fileids))) 
        for youtube_uri,rid in fileids:
            try:
                youtube_deleted = self.youtube_delete(youtube_uri)
                if youtube_deleted == True:
                    self.logger.debug('SUCCEEDED deleted from YouTube the video with the URL: "%s".' % (youtube_uri)) 
                    columns = ["Youtube_Deleted", "Processing_Status"]
                    columns = ','.join([urlquote(col) for col in columns])
                    url = '/attributegroup/Common:Delete_Youtube/RID;%s' % (columns)
                    obj = {'RID': rid,
                           'Youtube_Deleted': True,
                           'Processing_Status': 'success'
                           }
                    self.catalog.put(
                        url,
                        json=[obj]
                    )
                    self.logger.debug('SUCCEEDED updated the Common:Delete_Youtube table entry for the YouTube URL: "%s".' % (youtube_uri)) 
                else:
                    self.logger.debug('Failure in deleting from YouTube the video with the URL: "%s".' % (youtube_uri)) 
                    self.sendMail('FAILURE Delete YouTube: YouTube Failure', 'The video "%s" could not be deleted from Youtube.' % youtube_uri)
                    self.reportFailure(rid, 'YouTube Failure')
            except Exception as e:
                et, ev, tb = sys.exc_info()
                self.logger.error('got exception "%s"' % str(ev))
                self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                self.reportFailure(rid, str(e))
        
        
    """
    Update the Delete_Youtube table with the ERROR status
    """
    def reportFailure(self, rid, error_message):
        """
            Update the Delete_Youtube table with the failure result.
        """
        try:
            columns = ["Processing_Status"]
            columns = ','.join([urlquote(col) for col in columns])
            url = '/attributegroup/Common:Delete_Youtube/RID;%s' % (columns)
            obj = {'RID': rid,
                   'Processing_Status': '%s' % error_message
                   }
            self.catalog.put(
                url,
                json=[obj]
            )
            self.logger.debug('SUCCEEDED updated the Delete_Youtube table for the RID "%s"  with the Processing_Status result "%s".' % (rid, error_message)) 
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE Delete YouTube: reportFailure ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            
        