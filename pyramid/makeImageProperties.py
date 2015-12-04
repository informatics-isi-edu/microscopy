#!/usr/bin/env python

#
# makeImagePropertie.py
#
# make ImageProperties.xml from deepzoom.dzi and the dzi zoom 
# file structure and store along with the zoom levels
#
# usage: ./makeImageProperties.py hukid/HuKid_18_1a.dzi 
#


import os
import json
import sys
#from lxml import etree
from xml.etree import cElementTree as etree

def load(dzi_filename):
    if os.path.exists(dzi_filename):
        doc = etree.parse(dzi_filename)
        root = doc.getroot()
#        print "root : ",root
#        print root.keys()
#        print root.items()
        o=root.get('Overlap') # attribute
        t=root.get('TileSize') # attribute
        for child in root:
          w=child.attrib['Width']
          h=child.attrib['Height']
    xml = { 'overlap': int(o), 'tileSize': int(t), 'width': int(w), 'height': int(h)}
    return xml

def numeric_compare(x, y):
        return int(x) - int(y)

#  HuKid_18_1a.dzi
#  HuKid_18_1a_files
def dirloc(fname, cfg):
    dloc=fname.replace('.dzi','_files');
    if not os.path.isdir(dloc):
        sys.stderr.write('did not find data directory location'+dloc)
        sys.exit(1)
    zooms = os.listdir(dloc)
    try:
        i = zooms.index('ImageProperties.xml')
    except ValueError:
        i = -1
        # good, no match
    if (i != -1):
        zooms.remove('ImageProperties.xml')
    zooms.sort(cmp=numeric_compare)

    min=zooms[0]
    max=zooms[-1]
    sums=len(os.listdir(os.path.join(dloc,min)))
    v=sums
    for z in zooms:
        files=os.listdir(os.path.join(dloc,z))
        p=len(files)
        if(p == v):
          min=z
        else:
          sums=sums+p;
    cfg['min']= int(min)
    cfg['max']= int(max)
    cfg['total']=sums
    cfg['dloc']=dloc
    return dloc

def makeXml(cfg):
    image_descriptor = """\
<?xml version="1.0" encoding="UTF-8"?>
<IMAGE_PROPERTIES
                    width="%(width)d"
                    height="%(height)d"
                    numTiles="%(total)d"
                    numImages="1"
                    version="2.0"
                    levelScale="2"
                    tileWidth="%(tileSize)d"
                    overlap="%(overlap)d"
                    tileHeight="%(tileSize)d"
                    channelName="combo"
                    minLevel="%(min)d"
                    maxLevel="%(max)d"
                    data="%(dloc)s"
/>
"""%cfg
    return image_descriptor

def writeXml(desc,dloc):
    image_loc = dloc+'/ImageProperties.xml'
    f = open(image_loc, 'w')
    f.write(desc)
    f.close

###### main #######
try:
    dzi_filename = sys.argv[1]
    cfg = load(dzi_filename)
    dloc = dirloc(dzi_filename,cfg)
    desc=makeXml(cfg)
    print desc
    writeXml(desc,dloc)
except:
    sys.stderr.write('\nusage: makeImageProperties.py file.dzi\n\n')
    raise

