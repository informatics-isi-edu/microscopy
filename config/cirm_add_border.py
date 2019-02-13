#!/usr/bin/python3

"""Add a border to the CIRM thumbnails.

Usage:
  ./cirm_add_border.py -s <SERVER> -c <CREDENTIALS>  
  
  where:
    -s SERVER, --server=SERVER
                          Host name
    -c CREDENTIALS, --credentials=CREDENTIALS
                          Credentials file

The script generates a shell script for adding a grey border of 2px width to the thumbnails.
It is based on the usage of the "convert" program that is a member of the "ImageMagick" package.
If the "ImageMagick" package is not yet installed, run:

    yum install ImageMagick
    
Example of usage:

    ~/cirm_add_border.py -s cirm.isrd.isi.edu -c ~/.deriva/cirm_credential.json
    
A script named "cirm_add_border.sh" is generated such that for each non NULL "Thumbnail" value of the "Scan" table, it:
    - renames the <Thumbnail> file to <Thumbnail>_original
    - applies the "convert" function having as input the <Thumbnail>_original file and as output the <Thumbnail> file:
        
        convert -border 2 -bordercolor grey <Thumbnail>_original <Thumbnail>
        
In that way, the <Thumbnail> file will be replaced by a file having a border, and the values of the "Thumbnail" column of the "Scan" table don't need to be changed.
In the same time, the original <Thumbnail> file is preserved in same directory, renamed with the suffix "_original".

Once the shell script "cirm_add_border.sh" is generated, as "root" user run:

    cp cirm_add_border.sh /home/cirmusc/
    chown cirmusc:cirmusc /home/cirmusc/cirm_add_border.sh
    chmod +x /home/cirmusc/cirm_add_border.sh
    su -c "/home/cirmusc/cirm_add_border.sh" - cirmusc

"""
import os
import sys
import traceback
import json
from optparse import OptionParser
from deriva.core import ErmrestCatalog, HatracStore, urlquote, urlunquote

"""
Check that both the rename and convert operations were successfully.
Exit the script in case of any failure.
"""
def check(fp, operation, filename, margin):
    fp.write('%s\tif [ $? != 0 ]\n' % (margin))
    fp.write('%s\tthen\n' % (margin))
    fp.write('%s\t\techo "Failure in %s the file \\"%s\\"."\n' % (margin, operation, filename))
    fp.write('%s\t\texit 1\n' % (margin))
    fp.write('%s\tfi\n\n' % (margin))
    
"""
Get the <SERVER> and the <CREDENTIALS> arguments.
"""
parser = OptionParser()
parser.header = {}
parser.add_option('-s', '--server', action='store', dest='server', type='string', help='Host name')
parser.add_option('-c', '--credentials', action='store', dest='credentials', type='string', help='Credentials file')

(options, args) = parser.parse_args()

if not options.server:
    print ('ERROR: Missing host name')
    sys.exit()

if not options.credentials:
    print ('ERROR: Missing credentials file')
    sys.exit()

"""
Get the non NULL "Thumbnail" values from the "Scan" table.
"""
servername = options.server
credentialsfilename = options.credentials
catalog = 1
schema = 'Microscopy'
table = 'Scan'
column = 'Thumbnail'
prefix = '/var/www/html'
output = '%s_add_border.sh' % servername.split('.')[0]

credentials = json.load(open(credentialsfilename))
catalog = ErmrestCatalog('https', servername, catalog, credentials)

url = '/attribute/%s:%s/!%s::null::/%s' % (urlquote(schema), urlquote(table), urlquote(column), urlquote(column))
print ('Query URL: "https://%s/ermrest/catalog/1%s"' % (servername, url))

resp = catalog.get(url)
resp.raise_for_status()
rows = resp.json()

thumbnails = []
for row in rows:
    thumbnails.append(row[column])
    
"""
Generate the shell script.
"""
fp = open(output, 'w')
fp.write('#!/bin/bash\n\n')
for thumbnail in thumbnails:
    filename = '%s%s' % (prefix, urlunquote(thumbnail))
    original = '%s_original' % (filename)
    fp.write('if [ ! -f "%s" ]\n' % (original))
    fp.write('then\n')
    fp.write('\tmv "%s" "%s"\n' % (filename, original))
    check(fp, 'moving', "%s" % (filename), '')
    fp.write('\tif [ ! -f "%s" ]\n' % (filename))
    fp.write('\tthen\n')
    fp.write('\t\tconvert -border 2 -bordercolor grey "%s" "%s"\n\n' % (original, filename))
    check(fp, 'converting', "%s" % (filename), '\t')
    fp.write('\tfi\n')
    fp.write('fi\n\n')
fp.close()

print ('SUCCEEDED created the script "%s".' % (output))

sys.exit(0)
 
