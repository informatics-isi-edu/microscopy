#!/usr/bin/python

import os
import sys
import traceback
import json
from optparse import OptionParser
import datetime
from deriva.core import ErmrestCatalog, HatracStore, urlquote
import time
import czifile

count_no_czi = 0
count_hatrac_error = 0
count_czi_error = 0
count_czi_success = 0
count_hatrac_success = 0

"""
Extract the file from hatrac in the /var/www/scratch directory
"""
def getHatracFile(filename, file_url):
    try:
        hatracFile = '%s/%s' % ('/var/www/scratch', filename)
        hatrac_store.get_obj(file_url, destfilename=hatracFile)
        #print 'File "%s", %d bytes.' % (hatracFile, os.stat(hatracFile).st_size)
        return hatracFile
    except:
        print 'Can not extract "%s" file from hatrac.'
        et, ev, tb = sys.exc_info()
        print 'got unexpected exception "%s"' % str(ev)
        print '%s' % str(traceback.format_exception(et, ev, tb))
        return None

def getAcquisitionDate(row):
    global count_no_czi, count_czi_error, count_hatrac_error, count_czi_success, count_hatrac_success
    mdate = row[rct][:10]
    if row[czi] != None:
        cziFile = getHatracFile(row[filename], row[czi])
        if cziFile != None:
            count_hatrac_success = count_hatrac_success + 1
            print '%d: "%s", %.2f GB' % (count_hatrac_success, cziFile, (os.stat(cziFile).st_size/1000000000.))
            try:
                cf = czifile.CziFile(cziFile)
                mdate = cf.metadata.findall('Metadata/Information/Image/AcquisitionDateAndTime')[0].text[:10]
                count_czi_success = count_czi_success + 1
            except:
                count_czi_error = count_czi_error + 1
                et, ev, tb = sys.exc_info()
                print 'Can not extract the Acquisition Date from the "%s" file.' % (cziFile)
                print '%s' % str(traceback.format_exception(et, ev, tb))
            os.remove(cziFile)
        else:
            count_hatrac_error = count_hatrac_error + 1
    else:
        count_no_czi = count_no_czi + 1
    return mdate

parser = OptionParser()
parser.header = {}
parser.add_option('-s', '--server', action='store', dest='server', type='string', help='Host name')
parser.add_option('-c', '--credentials', action='store', dest='credentials', type='string', help='Credentials file')
parser.add_option('-S', '--skip', action='store_true', dest='skip', default=False, help='Take the Acquisition Date from RCT')

(options, args) = parser.parse_args()

if not options.server:
    print 'ERROR: Missing host name'
    sys.exit()

if not options.credentials:
    print 'ERROR: Missing credentials file'
    sys.exit()

servername = options.server
credentialsfilename = options.credentials
catalog = 1
schema = 'Microscopy'
table = 'Scan'
acquisition = 'Acquisition Date'
czi = 'HTTP URL'
rid = 'RID'
rct = 'RCT'
filename = 'filename'

credentials = json.load(open(credentialsfilename))
catalog = ErmrestCatalog('https', servername, catalog, credentials)

hatrac_store = HatracStore(
    'https', 
    servername,
    {'cookie': credentials['cookie']}
)
url = '/attribute/%s:%s/%s::null::/%s,%s,%s,%s' % (urlquote(schema), urlquote(table), urlquote(acquisition), urlquote(rid), urlquote(rct), urlquote(filename), urlquote(czi))
print 'Query URL: "%s"' % url

resp = catalog.get(url)
resp.raise_for_status()
rows = resp.json()

entities = []
for row in rows:
    if options.skip == True:
        acquisitionDate = row[rct][:10]
    else:
        acquisitionDate = getAcquisitionDate(row)
    entities.append({rid: row[rid], acquisition: acquisitionDate})
    
print 'Total rows to be updated: %d' % len(entities)
print 'Total rows with Acquisition Date from czi: %d' % count_czi_success
print 'Total rows w/o a czi file: %d' % count_no_czi
print 'Total rows with hatrac error: %d' % count_hatrac_error
print 'Total rows with czi error: %d' % count_hatrac_error

fp = open('acquisition.json', 'w')
json.dump(entities, fp, indent=4)
fp.close()

columns = [acquisition]
columns = ','.join([urlquote(col) for col in columns])
url = '/attributegroup/%s:%s/%s;%s' % (urlquote(schema), urlquote(table), urlquote(rid), columns)
print 'Update URL: "%s"' % url

resp = catalog.put(
    url,
    json=entities
)
resp.raise_for_status()
print 'SUCCEEDED updated the table "%s" with the Acquisition Date.' % (table)

sys.exit(0)
 
