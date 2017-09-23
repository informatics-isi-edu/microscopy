#!/usr/bin/python

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
"""
Load configuration for the Video Water Marker.
Check with ermrest for videos that need water markers.
Generate the new video with the water marker.
Update ermrest and hatrac with the new video file.
"""

import os
import logging
import json
import sys
import traceback

from videocli.client import ErmrestClient, UnresolvedAddress, NetworkError, ProtocolError, MalformedURL
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
    url = cfg.get('url', None)
    if not url:
        logger.error('Ermrest URL must be given.')
        return None
    
    watermark = cfg.get('watermark', None)
    if not watermark or not os.path.isfile(watermark):
        logger.error('The water mark file must be given and exist.')
        return None

    ffmpeg = cfg.get('ffmpeg', None)
    if not ffmpeg or not os.path.isfile(ffmpeg):
        logger.error('The Fast Forward MPEG must be given and exist.')
        return None

    video_resources = cfg.get('video_resources', None)
    if not video_resources or not os.path.isdir(video_resources):
        logger.error('The video resources directory must be given and exist.')
        return None

    cookie = cfg.get('cookie', None)
    if not cookie:
        logger.error('CIRM cookie must be provided.')
        return None

    data_scratch = cfg.get('data_scratch', None)
    if not data_scratch:
        logger.error('data_scratch directory must be provided.')
        return None

    mail_server = cfg.get('mail_server', None)
    mail_sender = cfg.get('mail_sender', None)
    mail_receiver = cfg.get('mail_receiver', None)
    timeout = cfg.get('timeout', 30)
    limit = cfg.get('limit', 5)
    chunk_size = cfg.get('chunk_size', 10000000)

    # Establish Ermrest client connection
    try:
        client = ErmrestClient(baseuri=url, \
                               cookie=cookie, \
                               chunk_size=chunk_size, \
                               watermark=watermark, \
                               ffmpeg=ffmpeg, \
                               video_resources=video_resources, \
                               data_scratch=data_scratch, \
                               timeout=timeout, \
                               limit=limit, \
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
    if len(sys.argv) < 2:
        raise
    config_filename = sys.argv[1]
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
    sys.stderr.write('\nusage: videoMarker.py config-file\n\n')
    sys.exit(1)

