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
Load configuration for the YouTube Uploader.
Check with ermrest for videos that need to be uploaded on YouTube.
Update ermrest with the YouTube video link.
"""

import os
import logging
import json
import sys
import traceback

from youtubecli.client import ErmrestClient, UnresolvedAddress, NetworkError, ProtocolError, MalformedURL
from logging.handlers import RotatingFileHandler    

FORMAT = '%(asctime)s: %(levelname)s <%(module)s>: %(message)s'
logger = logging.getLogger(__name__)

# Exit return codes
__EXIT_SUCCESS = 0
__EXIT_FAILURE = 1

# Loglevel dictionary
__LOGLEVEL = {'error': logging.ERROR,
              'warning': logging.WARNING,
              'info': logging.INFO,
              'debug': logging.DEBUG}

def load(config_filename):
    """
    Read the configuration file.
    """
    
    # Load configuration file, or create configuration based on arguments
    cfg = {}
    if os.path.exists(config_filename):
        f = open(config_filename, 'r')
        try:
            cfg = json.load(f)
            loglevel = cfg.get('loglevel', None)
            logfile = cfg.get('log', None)
            if loglevel and logfile:
                rotatingFileHandler = RotatingFileHandler(logfile, maxBytes=1000000, backupCount=7)
                rotatingFileHandler.setFormatter(logging.Formatter(FORMAT))
                logger.addHandler(rotatingFileHandler)
                logger.setLevel(__LOGLEVEL.get(loglevel))
            else:
                logging.getLogger().addHandler(logging.NullHandler())
            logger.debug("config: %s" % cfg)
        except ValueError as e:
            logger.error('Malformed configuration file: %s' % e)
            return None
        else:
            f.close()
    else:
        sys.stderr.write('Configuration file: "%s" does not exist.\n' % config_filename)
        return None
    
    # Ermrest settings
    url = os.getenv('URL', None)
    if url == None:
        logger.error('URL must be supplied through the "URL" environment variable.')
        logger.error('Launch the script "env URL=https://foo.org/ermrest/catalog/N youtubeUploader.py --config config-file".')
        return None
        
    logger.info('URL: %s' % url)
    
    cookie = cfg.get('cookie', None)
    if not cookie:
        logger.error('CIRM cookie must be provided.')
        return None

    client_secrets_file = cfg.get('client_secrets_file', None)
    if not client_secrets_file or not os.path.isfile(client_secrets_file):
        logger.error('The client secrets file must be given and exist.')
        return None

    client_oauth2_file = cfg.get('client_oauth2_file', None)
    if not client_oauth2_file or not os.path.isfile(client_oauth2_file):
        logger.error('The client oauth2 file must be given and exist.')
        return None

    data_scratch = cfg.get('data_scratch', None)
    if not data_scratch:
        logger.error('data_scratch directory must be provided.')
        return None

    ffmpeg = cfg.get('ffmpeg', None)
    if not ffmpeg or not os.path.isfile(ffmpeg):
        logger.error('The Fast Forward MPEG must be given and exist.')
        return None

    ffprobe = cfg.get('ffprobe', None)
    if not ffprobe or not os.path.isfile(ffprobe):
        logger.error('The multimedia streams analyzer must be given and exist.')
        return None

    category = cfg.get('category', "28")
    keywords = cfg.get('keywords', "rbk,gudmap")
    privacyStatus = cfg.get('privacyStatus', "public")

    timeout = cfg.get('timeout', 30)
    limit = cfg.get('limit', 5)
    chunk_size = cfg.get('chunk_size', 10000000)
    mail_server = cfg.get('mail_server', None)
    mail_sender = cfg.get('mail_sender', None)
    mail_receiver = cfg.get('mail_receiver', None)

    # Establish Ermrest client connection
    try:
        client = ErmrestClient(baseuri=url, \
                               cookie=cookie, \
                               client_secrets_file=client_secrets_file, \
                               client_oauth2_file=client_oauth2_file, \
                               data_scratch=data_scratch, \
                               ffmpeg=ffmpeg, \
                               ffprobe=ffprobe, \
                               category=category, \
                               keywords=keywords, \
                               privacyStatus=privacyStatus, \
                               timeout=timeout, \
                               limit=limit, \
                               chunk_size=chunk_size, \
                               mail_server=mail_server, \
                               mail_sender=mail_sender, \
                               mail_receiver=mail_receiver,
                               logger=logger)
        client.connect()
    except MalformedURL as err:
        logger.error(err)
        return None
    except UnresolvedAddress as err:
        logger.error(err)
        return None
    except NetworkError as err:
        logger.error(err)
        return None
    except ProtocolError as err:
        logger.error(err)
        return None
    except:
        et, ev, tb = sys.exc_info()
        logger.error('got INIT exception "%s"' % str(ev))
        logger.error('%s' % str(traceback.format_exception(et, ev, tb)))
        return None
    
    return client

try:
    if len(sys.argv) < 3:
        raise
    config_filename = sys.argv[2]
    client = load(config_filename)
    if client:
        try:
            client.start()
        except:
            pass
except:
    et, ev, tb = sys.exc_info()
    sys.stderr.write('got exception "%s"' % str(ev))
    sys.stderr.write('%s' % str(traceback.format_exception(et, ev, tb)))
    sys.stderr.write('\nusage: env URL=https://foo.org/ermrest/catalog/N youtubeUploader.py --config config-file\n\n')
    sys.exit(1)

