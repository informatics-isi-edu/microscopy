#!/usr/bin/python3

import subprocess
import re
from lxml import etree

class BioformatsClient (object):
    """Client for Bioformats.
    """
    
    def __init__(self, **kwargs):
        self.mappedDict = {}
        self.showinf = kwargs.get("showinf")
        self.cziFile = kwargs.get("cziFile")
        self.czirules = kwargs.get("czirules")
        self.logger = kwargs.get("logger")
        self.rulesRoot = etree.parse(self.czirules).getroot()
        self.originalMetadata = self.rulesRoot.findall('OriginalMetadata')


    def transform(self, rule, keyValue):
        pattern = rule.find('Pattern')
        if pattern != None:
            template = rule.find('Template')
            m = re.search(pattern.text.strip(), keyValue)
            if m != None:
                vals = template.text.strip().split()
                res = []
                for val in vals:
                    try:
                        value = m.group(val)
                    except:
                        value = val
                    res.append(value)
                return ' '.join(res)
            else:
                return keyValue
        else:
            return keyValue
    
    def getOriginalMetadataValue(self, keyName, keyValue):
        for rule in self.originalMetadata:
            key = rule.find('Key')
            map = rule.find('Map')
            if keyName == key.text.strip():
                return (map.text.strip(), self.transform(rule, keyValue))
        return (None, None)
    
    def getOriginalMetadataAttribute(self, tag, attributes):
        rule = self.rulesRoot.find(tag)
        if rule != None:
            attribute = rule.find('Attribute')
            map = rule.find('Map')
            attributeName = attribute.text.strip()
            for name, value in attributes:
                if name == attributeName:
                    return (map.text.strip(), value)
        return (None, None)
    
    def setMappedElement(self, element):
        ns='{%s}' % element.nsmap[None]
        tag = element.tag.replace(ns, '')
        attributes = None
        if len(element.items()) > 0:
            attributes = element.items()
        if attributes != None:
            map, mapValue = self.getOriginalMetadataAttribute(tag, attributes)
            if map != None and mapValue != None:
                self.mappedDict[map] = mapValue
        if tag == 'OriginalMetadata':
            key = element.find('Key')
            value = element.find('Value')
            if key != None and value != None:
                keyName = ''
                keyValue = ''
                try:
                    keyName = str(key.text.strip())
                    keyValue = str(value.text.strip())
                    map, mapValue = self.getOriginalMetadataValue(keyName, keyValue)
                    if map != None and mapValue != None:
                        self.mappedDict[map] = mapValue
                except:
                    pass
        elif len(element) > 0:
            for child in element:
                self.setMappedElement(child)
    
    def getXmlBioformats(self):
        args = [self.showinf, self.cziFile, '-omexml-only', '-nopix']
        f = open('temp.xml', 'w')
        p = subprocess.Popen(args, stdout=f, stderr=subprocess.PIPE)
        p.wait()
        returncode = p.returncode
        if returncode == 0:
            f.close()
            return 0
        else:
            err = p.stderr.read()
            self.logger.error(err)
            return 1

    def getMetadata(self):
        if self.getXmlBioformats() == 0:
            root = etree.parse("temp.xml").getroot()
            self.setMappedElement(root)
            try:
                self.mappedDict['Channel Name'] = self.mappedDict['Dye Name']
                self.mappedDict['Channels'] = len(self.mappedDict['Dye Name'].split(','))
            except:
                self.mappedDict['Channel Name'] = ''
                self.mappedDict['Channels'] = 0
            return self.mappedDict
        else:
            return None

