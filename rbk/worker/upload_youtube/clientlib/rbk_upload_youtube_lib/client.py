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
import subprocess
import hashlib

import httplib
import httplib2
import random

from deriva.core import PollingErmrestCatalog, HatracStore, urlquote

from apiclient.discovery import build
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client.tools import argparser, run_flow

mail_footer = 'Do not reply to this message.  This is an automated message generated by the system, which does not receive email messages.'

YOUTUBE_UPLOAD_SCOPE = set(["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.upload"])
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"
    
httplib2.RETRIES = 1
MAX_RETRIES = 10            
RETRIABLE_EXCEPTIONS = (    
    httplib2.HttpLib2Error, 
    IOError, 
    httplib.NotConnected,
    httplib.IncompleteRead, 
    httplib.ImproperConnectionState,
    httplib.CannotSendRequest, 
    httplib.CannotSendHeader,
    httplib.ResponseNotReady, 
    httplib.BadStatusLine)

RETRIABLE_STATUS_CODES = [500, 502, 503, 504]

MISSING_CLIENT_SECRETS_MESSAGE = "WARNING: Please configure OAuth 2.0"

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
        self.data_scratch = kwargs.get("data_scratch")
        self.ffmpeg = kwargs.get("ffmpeg")
        self.ffprobe = kwargs.get("ffprobe")
        self.category = kwargs.get("category")
        self.keywords = kwargs.get("keywords")
        self.privacyStatus = kwargs.get("privacyStatus")
        self.text_position = kwargs.get("text_position")
        self.store = HatracStore(
            self.scheme, 
            self.host,
            {'cookie': self.cookie}
        )
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
        argparser.add_argument("--config", required=True, help="YouTube configuration file")
        self.args = argparser.parse_args()
        self.args.category = self.category
        self.args.keywords = self.keywords
        self.args.privacyStatus = self.privacyStatus
        self.args.noauth_local_webserver = True
        self.logger.debug('Upload YouTube Client initialized.')

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
    Start the process for uploading videos to YouTube
    """
    def start(self):
        try:
            self.youtube_authenticated_service()
            if self.youtube is not None:
                self.logger.debug('Authenticated to the YouTube service.')
                self.uploadVideo()
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE YouTube Upload: unexpected exception', '%s\nThe process might have been stopped\n' % str(traceback.format_exception(et, ev, tb)))
            raise
        
    """
    Get the YouTube credentials
    """
    def youtube_authenticated_service(self):
        flow = flow_from_clientsecrets(self.client_secrets_file, scope=YOUTUBE_UPLOAD_SCOPE, message=MISSING_CLIENT_SECRETS_MESSAGE)
        storage = Storage(self.client_oauth2_file)
        credentials = storage.get()
        if credentials is None or credentials.invalid:
            credentials = run_flow(flow, storage, self.args)
        self.youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, http=credentials.authorize(httplib2.Http()))
        
    """
    Create a request to upload a video to YouTube
    """
    def youtube_request(self):
        tags = None
        if self.args.keywords:
            tags = self.args.keywords.split(",")
        body=dict(
            snippet=dict(
                title=self.args.title,
                description=self.args.description,
                tags=tags,
                categoryId=self.args.category
            ),
            status=dict(
                privacyStatus=self.args.privacyStatus
            )
        )
        request = self.youtube.videos().insert(
            part=",".join(body.keys()),
            body=body,
            media_body=MediaFileUpload(self.args.file, chunksize=-1, resumable=True)
        )
        return request

    """
    Upload a video to YouTube
    """
    def youtube_upload(self, request):
        response = None
        retry = 0
        id = None
        while response is None:
            error = None
            try:
                self.logger.debug('Uploading file...')
                status, response = request.next_chunk()
                if 'id' in response:
                    id = response['id']
                    self.logger.debug("Video id '%s' was successfully uploaded." % id)
                else:
                    self.logger.error("The upload failed with an unexpected response: %s" % response)
            except HttpError, e:
                if e.resp.status in RETRIABLE_STATUS_CODES:
                    error = "A retriable HTTP error %d occurred:\n%s" % (e.resp.status, e.content)
                else:
                    raise
            except RETRIABLE_EXCEPTIONS, e:
                error = "A retriable error occurred: %s" % e
            if error is not None:
                self.logger.error(error)
                retry += 1
                if retry > MAX_RETRIES:
                    self.logger.error("No longer attempting to retry.")
                    break
                max_sleep = 2 ** retry
                sleep_seconds = random.random() * max_sleep  
                self.logger.debug("Sleeping %f seconds and then retrying..." % sleep_seconds)
                time.sleep(sleep_seconds)
        return id
                
    """
    Upload videos to YouTube
    """
    def uploadVideo(self):
        url = '/entity/Immunofluorescence:Slide_Video/!Identifier::null::&!Name::null::&!Bytes::null::&Media_Type=video%2Fmp4/Processing_Status=in%20progress;Processing_Status::null::' 
        resp = self.catalog.get(url)
        resp.raise_for_status()
        videos = resp.json()
        videoids = []
        for video in videos:
            videoids.append((video['Accession_ID'], video['Name'], video['Title'], video['Description'], video['Identifier'], video['MD5'], video['YouTube_MD5'], video['YouTube_URI'], video['RID'], video['Consortium'], video['MP4_URI'], video['RCT'], video['RMT']))
                
        self.logger.debug('Processing %d video(s).' % (len(videoids))) 
        for accessionId,fileName,title,description,uri,md5,youtube_md5,youtube_uri,rid,consortium,mp4_uri,rct,rmt in videoids:
            if description == None:
                description = ''
            consortium_url = ''
            if consortium == 'GUD':
                consortium_url = 'gudmap.org'
            elif consortium == 'RBK':
                consortium_url = 'rebuildingakidney.org'
            f, MP4_URI= self.getVideoFile(fileName, uri, consortium_url, md5, accessionId)
            if f == None or MP4_URI == None:
                self.reportFailure(accessionId, 'error_no_video_file')
                continue
                
            if youtube_uri != None and youtube_md5 != md5:
                """
                We have an update.
                Mark the video to be deleted from YouTube
                """
                url = '/entity/Common:Delete_Youtube?defaults=RID,RCT,RMT'
                obj = {'YouTube_MD5': youtube_md5,
                       'YouTube_URI': youtube_uri,
                       'Record_Type': 'Immunofluorescence:Slide_Video',
                       'Record_RID': rid,
                       'Youtube_Deleted': False
                       }
                try:
                    r = self.catalog.post(
                        url,
                        json=[obj]
                    )
                    r.raise_for_status()
                    self.logger.debug('SUCCEEDED updated the Common:Delete_Youtube table entry for the YouTube URL: "%s".' % (youtube_uri)) 
                except:
                    et, ev, tb = sys.exc_info()
                    self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                    self.sendMail('FAILURE YouTube Upload: Delete_Youtube ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
                
                if mp4_uri != None:
                    """
                    We have an update.
                    Insert the old video into the Delete_Hatrac table
                    """
                    
                    self.logger.debug('Inserting the old MP4 video "%s" file into the Delete_Hatrac table.' % (fileName))
                    url = '/entity/Common:Delete_Hatrac?defaults=RID,RCT,RMT'
                    obj = {'Hatrac_MD5': mp4_uri.split('/')[-1],
                           'Hatrac_URI': mp4_uri,
                           'Hatrac_Deleted': False,
                           'Record_Type': 'Immunofluorescence:Slide_Video',
                           'Record_RID': rid,
                           'Record_RCT': rct,
                           'Record_RMT': rmt,
                           'Record_Deleted': False
                           }
                    try:
                        r = self.catalog.post(
                            url,
                            json=[obj]
                        )
                        r.raise_for_status()
                        self.logger.debug('SUCCEEDED updated the Common:Delete_Hatrac table entry for the Hatrac_URI: "%s".' % (mp4_uri)) 
                    except:
                        et, ev, tb = sys.exc_info()
                        self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                        self.sendMail('FAILURE YouTube Upload: Delete_Hatrac ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            
            self.logger.debug('Uploading the video "%s" to YouTube' % (fileName))
            
            """
            Get the video properties
            """
            cfg = self.getVideoProperties(f)
            if cfg != None:
                width,height = self.getVideoResolution(cfg)
                self.logger.debug('Video resolution: (%d x %d).' % (width, height)) 
            else:
                self.logger.debug('Could not get the video resolution.') 
                
            """
            Initialize YouTube video parameters
            """
            self.args.file = f
            self.args.title = ('%s:\n%s' % (consortium_url, title))[:64]
            self.args.description = description
            
            """
            Upload video to YouTube
            """
            try:
                request = self.youtube_request()
                if request is not None:
                    id = self.youtube_upload(request)
                    returncode = 0
                else:
                    returncode = 1
            except:
                et, ev, tb = sys.exc_info()
                self.logger.error('got unexpected exception "%s"' % str(ev))
                self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                self.sendMail('FAILURE YouTube Upload: YouTube ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
                returncode = 1
            
            if returncode != 0:
                self.logger.error('Can not upload to YouTube the "%s" file.' % (fileName)) 
                self.sendMail('FAILURE YouTube Upload', 'Can not upload to YouTube the "%s" file.' % (fileName))
                os.remove(f)
                """
                Update the Slide_Video table with the failure result.
                """
                self.reportFailure(accessionId, 'error_youtube_upload')
                continue
                
            """
            Upload the Slide_Video table with the SUCCESS status
            """
            columns = ["MP4_URI", "YouTube_MD5", "YouTube_URI", "Processing_Status"]
            #youtube_uri = "https://www.youtube.com/embed/%s?showinfo=0&rel=0" % id
            youtube_uri = "https://www.youtube.com/embed/%s?rel=0" % id
            os.remove(f)
            columns = ','.join([urlquote(col) for col in columns])
            url = '/attributegroup/Immunofluorescence:Slide_Video/Accession_ID;%s' % (columns)
            obj = {'Accession_ID': accessionId,
                   'MP4_URI': MP4_URI,
                   'YouTube_URI': youtube_uri,
                   'YouTube_MD5': md5,
                   'Processing_Status': 'success'
                   }
            try:
                r = self.catalog.put(
                    url,
                    json=[obj]
                )
                r.raise_for_status()
                self.logger.debug('SUCCEEDED updated the Immunofluorescence:Slide_Video table entry for the file: "%s".' % (fileName)) 
            except:
                et, ev, tb = sys.exc_info()
                self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                self.sendMail('FAILURE YouTube Upload: Delete_Hatrac ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            self.logger.debug('SUCCEEDED updated the entry for the "%s" file.' % (fileName)) 
            
        self.logger.debug('Ended uploading videos to YouTube.') 
        
    """
    Update the Slide_Video table with the ERROR status
    """
    def reportFailure(self, accessionId, error_message):
        """
            Update the Slide_Video table with the YouTube Upload failure result.
        """
        try:
            columns = ["Processing_Status"]
            columns = ','.join([urlquote(col) for col in columns])
            url = '/attributegroup/Immunofluorescence:Slide_Video/Accession_ID;%s' % (columns)
            obj = {'Accession_ID': accessionId,
                   "Processing_Status": '%s' % error_message
                   }
            self.catalog.put(
                url,
                json=[obj]
            )
            self.logger.debug('SUCCEEDED updated the Slide_Video table for the video Accession_ID "%s"  with the Processing_Status result "%s".' % (accessionId, error_message)) 
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE YouTube Upload: reportFailure ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            
    """
    Get the video file from hatrac
    """
    def getVideoFile(self, fileName, uri, consortium_url, md5, accessionId):
        try:
            MP4_URI = None
            self.logger.debug('Processing file: "%s".' % (fileName)) 
            videoFile = '%s/%s' % (self.data_scratch, fileName)
            self.store.get_obj(uri, destfilename=videoFile)
            self.logger.debug('File "%s", %d bytes.' % (videoFile, os.stat(videoFile).st_size)) 
            #"""
            if self.text_position != None:
                drawFile = self.drawVideoText(videoFile, consortium_url, self.text_position)
            else:
                drawFile = None
            if drawFile != None:
                self.logger.debug('File with text "%s", %d bytes.' % (drawFile, os.stat(drawFile).st_size)) 
                os.remove(videoFile)
                newFile = drawFile
                file_size = os.path.getsize(newFile)
                new_md5 = self.md5hex(newFile)
                new_sha256 = self.sha256sum(newFile)
                new_uri = '%s%s' % (uri[0:-len(md5)], new_md5)
                try:
                    if self.store.content_equals(new_uri, filename=newFile,  md5=new_md5) == True:
                        MP4_URI = new_uri
                except:
                    pass
                    
                if MP4_URI != None:
                    self.logger.info('Skipping the upload of the file "%s" as it already exists hatrac.' % fileName)
                    MP4_URI = new_uri
                else:
                    try:
                        MP4_URI = self.store.put_loc(new_uri,
                                                     newFile,
                                                     headers={'Content-Type': 'video/mp4'},
                                                     content_disposition = "filename*=UTF-8''%s" % fileName,
                                                     md5 = new_md5,
                                                     sha256 = new_sha256,
                                                     content_type = 'video/mp4',
                                                     chunked = True
                                                   )
                    except:
                        et, ev, tb = sys.exc_info()
                        self.logger.error('Can not transfer file "%s" in namespace "%s". Error: "%s"' % (fileName, new_uri, str(ev)))
                        self.sendMail('FAILURE YouTube Upload: HATRAC Error', 'Can not upload file "%s" in namespace "%s". Error: "%s"' % (fileName, new_uri, str(ev)))
                        self.reportFailure(accessionId, 'error_hatrac_upload')
                return (drawFile, MP4_URI)
            #"""
            return (videoFile,MP4_URI)
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('Can not get from hatrac the video file "%s"\n"%s"' % (fileName, str(ev)))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE YouTube Upload: getVideoFile ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            return (None, None)

    """
    Draw the video text
    """
    def drawVideoText(self, filename, videoText, position):
        """
        """
        ret = None
        videoProperties = self.getVideoProperties(filename)
        if videoProperties == None:
            self.logger.debug('Can get the video properties for the file %s.' % (filename)) 
        else:
            width,height = self.getVideoResolution(videoProperties)
            self.logger.debug('Video resolution: (%d x %d).' % (width, height)) 
            if height == None:
                self.logger.debug('Can get the height for the file %s.' % (filename)) 
            else:
                x,y = self.getTextOffset(position)
                self.logger.debug('Video text offset: (%s x %s).' % (x, y)) 
                if x == None or y == None:
                    self.logger.debug('Can get the text offset for the file %s.' % (filename)) 
                else:
                    fontsize = self.getTextFontSize(width, height)
                    self.logger.debug('fontsize: %s.' % (fontsize)) 
                    if fontsize == None:
                        self.logger.debug('The file "%s" has not HD resolution.' % (filename)) 
                    else:
                        file_name, file_extension = os.path.splitext(filename)
                        outputFile = '%s_%d%s' % (file_name, height, file_extension)
                        try:
                            args = [self.ffmpeg, '-y', '-i', '%s' % filename, '-vf', 'drawtext=\'text=\'\'%s\'\': fontcolor=blue: fontsize=%d: box=1: boxcolor=white@0.5: boxborderw=5: x=%s: y=%s\'' % (videoText, fontsize, x, y), '-codec:a', 'copy', '%s' %  outputFile]
                            p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                            stdoutdata, stderrdata = p.communicate()
                            returncode = p.returncode
                        except:
                            et, ev, tb = sys.exc_info()
                            self.logger.error('got unexpected exception "%s"' % str(ev))
                            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
                            self.sendMail('FAILURE YouTube Upload: ffmpeg ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
                            returncode = 1
                            
                        if returncode != 0:
                            print 'returncode=%d' % returncode
                            self.logger.error('Can not draw text to the video "%s" file.\nstdoutdata: %s\nstderrdata: %s\n' % (filename, stdoutdata, stderrdata)) 
                            self.sendMail('FAILURE YouTube Upload', 'Can not draw text to the video "%s" file.\nstdoutdata: %s\nstderrdata: %s\n' % (filename, stdoutdata, stderrdata))
                        else:
                            ret = outputFile

        return ret

    """
    Get the properties of the video file
    """
    def getVideoProperties(self, filename):
        """
        """
        ret = None
        try:
            args = [self.ffprobe, '-v', 'quiet', '-print_format', 'json', '-show_streams', '-i', '%s' % filename]
            p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdoutdata, stderrdata = p.communicate()
            returncode = p.returncode
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            self.sendMail('FAILURE YouTube Upload: ffprobe ERROR', '%s\n' % str(traceback.format_exception(et, ev, tb)))
            returncode = 1
            
        if returncode != 0:
            self.logger.error('Can not get the video properties of the "%s" file.\nstdoutdata: %s\nstderrdata: %s\n' % (filename, stdoutdata, stderrdata)) 
            self.sendMail('FAILURE YouTube Upload', 'Can not get the video properties of the "%s" file.\nstdoutdata: %s\nstderrdata: %s\n' % (filename, stdoutdata, stderrdata))
        else:
            ret = json.loads(stdoutdata)

        return ret

        
    """
    Get the properties of the video file
    """
    def getVideoResolution(self, video):
        """
        """
        width = None
        height = None
        
        try:
            width = video.get('streams',None)[0].get('width',0)
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            
        try:
            height = video.get('streams',None)[0].get('height',0)
        except:
            et, ev, tb = sys.exc_info()
            self.logger.error('got unexpected exception "%s"' % str(ev))
            self.logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
            
        return (width, height)

    """
    Get the offset of the video text
    """
    def getTextOffset(self, position):
        """
        """
        if position == 'upper left':
            x = '5'
            y = '0'
        elif position == 'lower left':
            x = '5'
            y = '(h-text_h-5)'
        elif position == 'upper right':
            x = '(w-text_w-5)'
            y = '0'
        elif position == 'lower right':
            x = '(w-text_w-5)'
            y = '(h-text_h-5)'
        else:
            x = None
            y = None
            
        return (x, y)

    """
    Get the fontsize of the video text
    """
    def getTextFontSize(self, width, height):
        """
        """
        if height >= 1080:
            fontsize = 44
        elif height >= 720:
            fontsize = 36
        else:
            fontsize = None
            
        return fontsize

    """
    Get the hexa md5 checksum of the file.
    """
    def md5hex(self, fpath):
        h = hashlib.md5()
        try:
            f = open(fpath, 'rb')
            try:
                b = f.read(4096)
                while b:
                    h.update(b)
                    b = f.read(4096)
                return h.hexdigest()
            finally:
                f.close()
        except:
            return None

    """
    Get the checksum of the file.
    """
    def sha256sum(self, fpath):
        h = hashlib.sha256()
        try:
            f = open(fpath, 'rb')
            try:
                b = f.read(4096)
                while b:
                    h.update(b)
                    b = f.read(4096)
                return h.hexdigest()
            finally:
                f.close()
        except:
            return None

