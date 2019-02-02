#!/usr/bin/env python3

##
##  /svn-src/printer/src/cxi/utils.py
##

import sys
import socket
import re
from .cxifont import *

DEBUG = 0
XSTART = 10
YSTART = 10

SPACE = " "
EOL = "\r\n"
VAR = "VARIABLE"
WRITE = "WRITE"
END = "END"
QQ = "?"

### key for returning structure from making labels ###
CXI_RET='Return value'
CXI_MSG='Return Message'

### cxi's configuration settings ###
CXI_SETTING = {
"FEED_TYPE":"GAP",
"WIDTH":"90",
"GAP_SIZE":"19",
"DARKNESS":"250",
"RECALIBRATE":"ON",
"PRINT_MODE":"TT",
"REPORT_LEVEL":"1",
"REPORT_TYPE":"SERIAL",
"ETHERNET GARP":"5",
"USER_FEEDBACK":"ON",
"ETHERNET RTEL":"ON",
"ETHERNET RTEL TIMEOUT":"100"
}

CXI_BOX_SETTING = {
"FEED_TYPE":"GAP",
"WIDTH":"200",
"GAP_SIZE":"19",
"DARKNESS":"0",
"RECALIBRATE":"ON",
"PRINT_MODE":"DT",
"REPORT_LEVEL":"1",
"REPORT_TYPE":"SERIAL",
"ETHERNET GARP":"5",
"USER_FEEDBACK":"ON",
"ETHERNET RTEL":"ON",
"ETHERNET RTEL TIMEOUT":"100"
}

CXI_CONFIG = {
"FEED_TYPE":"NONE",
"WIDTH":"NONE",
"GAP_SIZE":"NONE",
"DARKNESS":"NONE",
"RECALIBRATE":"NONE",
"PRINT_MODE":"NONE",
"REPORT_LEVEL":"NONE",
"REPORT_TYPE":"NONE",
"ETHERNET GARP":"NONE",
"SLEEP_AFTER":"NONE",
"USER_FEEDBACK":"NONE",
"ETHERNET RTEL TIMEOUT":"NONE",
"ETHERNET IP":"NONE",
"ETHERNET NETMASK":"NONE",
"ETHERNET GATEWAY":"NONE",
"ETHERNET RTEL":"NONE"
}

#####################################################################
class cxiAccess():
    """ socket link up with a cxi printer """
    def __init__(self, addr='mycxi.isi.edu', port=9100):
       self.port=port
       self.addr=addr
       try:
           socket.inet_pton(socket.AF_INET,self.addr)
       except socket.error:
#maybe a fqdn
           try:
               self.addr_ip = socket.gethostbyname( self.addr )
           except socket.gaierror:
               print 'Hostname could not be resolved.'
               self.addr_ip = None
       else:
           self.addr_ip=addr;
       self.cxi=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
       self.cxi.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY,1)
       self.isOpen=0

    def __del__(self):
       del self.cxi

    def extendtimeout(self, newtime):
       self.cxi.settimeout(newtime)

    def openLink(self) :
       """ cxiAccess.openLink, 1 okay, 0 failed """
       save_t=self.cxi.gettimeout()
       self.cxi.settimeout(1)
       if DEBUG :
          print "ip is ", self.addr_ip
          print "addr is ", self.addr
       try:
           self.cxi.connect((self.addr_ip,self.port))
       except socket.error, msg:
           print "Fail to connect to %s(%s), power cycle the printer" % (self.addr,msg)
           self.cxi.settimeout(save_t)
           raise
       self.isOpen=1
       self.cxi.settimeout(save_t)
       return 1

    def closeLink(self):
       if self.isOpen==1 :
           self.cxi.close()
       self.isOpen=0

    def send(self, data):
       """ cxiAccess.send, 1 okay, 0 failed """
       sz=len(data)
       sent=0
       try:
          sent = self.cxi.send(data)
       except socket.error:
          print "BAD, socket error on send"
          return 0
       if DEBUG:
           print "send: done"
       if sent == 0:
          print "BAD, socket connect closed"
          return 0
       return 1

    def config_recv(self, expected):
       """ cxiAccess.config_recv, a string of configuration setting """
       data="" 
       pattern = "= .+\r\n"
       while 1 :
           try:
               tmp = self.cxi.recv(1024)
#               if DEBUG :
#                   print "config_recv got ->",tmp
           except socket.error, socket.timeout:
               print "ERROR:socket got disconnected/timeout"
               break
           if tmp == 0:
               break
           if len(tmp) == 0:
               break
           data += tmp
           
           cnt=re.findall(pattern,data)
#           if DEBUG:
#               print "-> ",(len(tmp), tmp)
           if len(cnt) == expected:
               break
       if DEBUG:
           print "recv:\n", data
       return data

    def label_recv(self):
       """ cxiAccess.label_recv, number of label printed or 0 for failed, and
           reason if failed """
       printed = 0
       data = ""
       while 1 :
           try:
               tmp = self.cxi.recv(1024)
           except socket.error, socket.timeout:
               print "ERROR:socket got disconnected"
               break
           if DEBUG:
               print "recv got, ",tmp
           if tmp == 0:
               break
           if len(tmp) == 0:
               break
           ## out of ribbon
           if re.search("^o",tmp) != None:
               return -1, "Out of ribbon"
           ## out of paper
           if re.search("^O",tmp) != None:
               return -1, "Out of paper"
           ## printing error
           if re.search("^ERROR", tmp) != None:
               return -1, tmp
           data += tmp
           ## print is done
           if re.search("^R00000",tmp) != None:
               break

       if len(data) == 0:
           return 0, "Failed for some reason"
       done=re.findall("P[0-9]+",data)
       printed=len(done)
       return printed, "Success"

    def status_recv(self):
       try:
           tmp = self.cxi.recv(1024)
       except socket.error, socket.timeout:
           print "ERROR:socket got disconnected"
           return -1, "socket timeout/disconnected" 

       if DEBUG:
               print "recv got, ",tmp

       if tmp == 0:
           return -1, "socket timeout/disconnected" 

       if len(tmp) == 0:
           return -1, "did not receive anything"

       ## out of ribbon
       if re.search("^o",tmp) != None:
           return -1, "Out of ribbon"
       ## out of paper
       if re.search("^O",tmp) != None:
           return -1, "Out of paper"

       ## printing error
       if re.search("^ERROR", tmp) != None:
           return -1, "some ERROR with status check"

       ## print is done
       if re.search("^R00000",tmp) != None:
           return 1, "Success"
       return -1,tmp

#####################################################################
## utility routines
def setdebug():
    global DEBUG
    DEBUG=1

def yloc(delta):
    global YSTART
    return str(YSTART+(delta))

def xloc(delta):
    global XSTART
    return str(XSTART+(delta))

def pos(xdelta, ydelta):
    ret=SPACE + xloc(xdelta) + SPACE + yloc(ydelta) + SPACE
    return ret

def idbox(bsize):
    ret=SPACE + str(bsize) + SPACE + "40 3" + SPACE
    return ret

def apos(x, y):
    ret=SPACE + str(x) + SPACE + str(y) + SPACE
    return ret

#####################################################################
"""
note:  0x0a -> line feed
       0x0d -> carriage return
       0x17(23) -> end of transmit block
reset to printer default

! 0 0 0 0
VARIABLE RESET
END
"""
def reset2Default_():
    pclcmds = "! 0 0 0 0" + EOL + \
      "VARIABLE RESET" + EOL + \
      "END " + EOL
    return pclcmds

"""
force a calibration, should press feed button or print a sample label

! 0 0 0 0
VARIABLE INDEX SETTING CALIBRATE
END
"""
def calibrateNow_():
    pclcmds = "! 0 0 0 0" + EOL + \
      "VARIABLE INDEX SETTING CALIBRATE" + EOL + \
      "END" + EOL
    return pclcmds

"""
reset ethernet link
! 0 0 0 0
VARIABLE ETHERNET IP 128.9.129.113
VARIABLE ETHERNET NETMASK 255.255.240.0
VARIABLE ETHERNET GATEWAY 128.9.128.7
VARIABLE WRITE
VARIABLE ETHERNET RESET
END
"""
def resetConnectVars_(ip, netmask, gateway):
    pclcmds = "! 0 0 0 0" + EOL + \
      "VARIABLE ETHERNET IP" + SPACE + ip + EOL + \
      "VARIABLE ETHERNET NETMASK" + SPACE + netmask + EOL + \
      "VARIABLE ETHERNET GATEWAY" + SPACE + gateway + EOL + \
      "VARIABLE WRITE" + EOL +  \
      "VARIABLE ETHERNET RESET" + EOL + \
      "END" + EOL
    return pclcmds

def resetConnect_():
    pclcmds = "! 0 0 0 0" + EOL + \
      "VARIABLE ETHERNET RESET" + EOL + \
      "END" + EOL
    return pclcmds

"""
extract some configuration values
"""
def checkConfig_():
    pclcmds = "! 0 0 0 0" + EOL 
    for i in CXI_CONFIG:
        pclcmds = pclcmds + VAR + SPACE + i + SPACE + QQ + EOL

    pclcmds = pclcmds + VAR + SPACE + WRITE + EOL + END + EOL
    return pclcmds

def extract_configs_(data):
    global CXI_CONFIG
    dlist = data.splitlines()
    for i in dlist:
        a=i.split("=")
        key=a[0].strip()
        val=a[1].strip()
        if CXI_CONFIG.has_key(key):
            CXI_CONFIG[str(key)]=val
        else:
            if key=="ETHERNET RTEL TIMOUT":
                CXI_CONFIG["ETHERNET RTEL TIMEOUT"]=val
                continue
            if key=="GAP SIZE":
                CXI_CONFIG["GAP_SIZE"]=val
                continue
            if key=="ETHERNET IP ADDRESS":
                CXI_CONFIG["ETHERNET IP"]=val
                continue
            if key=="ETHERNET GARP TIME":
                CXI_CONFIG["ETHERNET GARP"]=val
                continue
            print 'Did not have this entry..',key
    return CXI_CONFIG

"""
"""
def checkStatus_():
    pclcmds = "!QS" + EOL
    return pclcmds

def checkFirmware_():
    pclcmds = "!QR" + EOL
    return pclcmds

"""
move the position up(-num) or down(num) from current
loc, this is to fine-tune loc within label. need to
press FEED button to set new INDEX location

! 0 0 0 0
VARIABLE POSITION -5
VARIABLE WRITE 
END

! 0 0 0 0
VARIABLE POSITION 5
VARIABLE WRITE 
END
"""
def setPosition_(pos):
    pclcmds = "! 0 0 0 0" + EOL + \
      "VARIABLE POSITION" + SPACE + str(pos) + EOL + \
      "VARIABLE WRITE" + EOL +  \
      "END" + EOL
    return pclcmds

"""
setup for Data General's StainerShield XT label
7/8 x 7/8, 1/8 gap, on 1"x1" backing, Thermal Transfer mode
"""
def configure4SSXT_() :
    c=len(CXI_SETTING)
    pclcmds = "! 0 0 0 0" + EOL 
    k=CXI_SETTING.keys()
    for i in k:
       pclcmds = pclcmds + VAR + SPACE + i + SPACE + CXI_SETTING[i] + EOL

    pclcmds = pclcmds + VAR + SPACE + WRITE + EOL + END + EOL
    return pclcmds

"""
setup for Data General's AAA label
2 x 1, 1/8 gap, on 1"x1" backing, Direct Thermal mode
"""
def configure4BOX_() :
    c=len(CXI_BOX_SETTING)
    pclcmds = "! 0 0 0 0" + EOL
    k=CXI_SETTING.keys()
    for i in k:
       pclcmds = pclcmds + VAR + SPACE + i + SPACE + CXI_BOX_SETTING[i] + EOL

    pclcmds = pclcmds + VAR + SPACE + WRITE + EOL + END + EOL
    return pclcmds

"""
force a power cycle after a lockup
23 23 23 23 23 67 76 69 65 82 23 23 23 23 23 13 10
"""
def powerCycle_():
    pclcmds= "%c%c%c%c%cCLEAR%c%c%c%c%c\r\n" % (0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17)
    return pclcmds

"""
wake a sleeping printer
C....C, 80 of them
"""
def wakeUp_():
    pclcmds = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"
    return pclcmds


"""
a test label
"""
def testLabel_():
    sample_idString="20131108-wnt1creZEG-RES-0-38-000"
    sample_pUrl="http://purl.org/usc-microscopy"
    purl="%s/slide?id=%s" %(sample_pUrl,sample_idString)
    pclcmds = "! 0 100 240 1" + EOL + \
      "DRAW_BOX"+ pos(0,-5) +"235 235 4" + EOL +\
      "TEXT 1"+ pos(10,5) + "ABACEFG" + EOL +  \
      "TEXT 1"+ pos(10,35) + "12345" + EOL +  \
      "TEXT 1"+ pos(10,65) + "abcefg" + EOL +  \
      "TEXT 1"+ pos(10,95) +"MNOPQ" + EOL +  \
      "BARCODE DATAMATRIX (,F,,,1,~)" + apos(140,140) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

"""
a test box label
"""
def testBoxLabel_():
    sample_idString="20131108-wnt1creZEG-RES-0-38-000"
    sample_pUrl="http://purl.org/usc-microscopy"
    purl="%s/slide?id=%s" %(sample_pUrl,sample_idString)
    pclcmds = "! 0 100 300 1" + EOL + \
      "DRAW_BOX"+ pos(0,-5) +"580 280 4" + EOL +\
      "TEXT 1"+ pos(10,5) + "ABACEFG" + EOL +  \
      "TEXT 1"+ pos(10,35) + "12345" + EOL +  \
      "TEXT 1"+ pos(10,65) + "abcefg" + EOL +  \
      "TEXT 1"+ pos(10,95) +"MNOPQ" + EOL +  \
      "BARCODE DATAMATRIX (,F,,,1.5,~)" + apos(420,100) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

def testBoxLabel2_():
    pclcmds=makeFontSampleLabel("font_file")
    return pclcmds

"""
"""
def makeSliceLabel_(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString):
    seq="% 4d" %(seqNum)
    rev="rev:%03d" %revNum
    purl="%s/slide?id=%s" %(pURL,idString)
    myfont=cxiFont()
    bsize=myfont.calcBits(expertID)
    pclcmds = "! 0 100 260 1" + EOL + \
      "TEXT 1" + pos(0,0) + date + seq +EOL +  \
      "TEXT 0" + pos(0,35) + genotype + EOL + \
      "TEXT 0" + pos(0,65) + antibody + EOL + \
      "TEXT 0" + pos(0,95) + experiment + EOL +  \
      "TEXT 0" + pos(0,135) + rev + EOL + \
      "DRAW_BOX" + pos(0,180) + idbox(bsize) + EOL +\
      "TEXT 0" + pos(5,185) + expertID + EOL + \
      "BARCODE DATAMATRIX (,F,,,1,~)" +apos(140,140) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

"""
"""
def makeBoxLabel_(date,genotype,expertID,disNum,pURL,idString,noteString):
    purl="%s/box?id=%s" %(pURL,idString)
    tmp=noteString
    myfont=cxiFont()
    line1,tmp=myfont.chopBits(tmp,350)
    line2,tmp=myfont.chopBits(tmp,350)
    line3,tmp=myfont.chopBits(tmp,350)
    line4,tmp=myfont.chopBits(tmp,350)
    pclcmds = "! 0 100 300 1" + EOL + \
      "TEXT 1" + pos(0,0) + date + EOL +  \
      "DRAW_BOX" + pos(185,-5) + "30 30 3" + EOL +\
      "STRING 18X23" + pos(190,0) + disNum +EOL +  \
      "TEXT 1" + pos(0,35) + genotype + EOL
    if line1 != 0:
        pclcmds=pclcmds+ "TEXT 1" + pos(0,70) + line1 + EOL
    if line2 != 0:
        pclcmds=pclcmds+ "TEXT 1" + pos(0,110) + line2 + EOL
    if line3 != 0:
        pclcmds=pclcmds+ "TEXT 1" + pos(0,150) + line3 + EOL
    if line4 != 0:
        pclcmds=pclcmds+ "TEXT 1" + pos(0,190) + line4 + EOL
    bsize=myfont.calcBits(expertID)
    pclcmds=pclcmds + \
      "DRAW_BOX" + pos(0,230) + idbox(bsize) + EOL +\
      "TEXT 0" + pos(5,235) + expertID + EOL + \
      "BARCODE DATAMATRIX (,F,,,1.5,~)" + apos(420,100) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

"""
"STRING 8X8(1,1,1,2) 20 240 " + guid + EOL \
"STRING 18X23(2,1,1,1) 10 40 " + line1 + EOL \
"ULTRA_FONT A30(4,0,0) 10 40 " + line1 + EOL \
"""
def makeNoteLabel_(date,expertID,seqNum,pURL,idString,noteString):
    seq="% 4d" %(seqNum)
    purl="%s/slide?id=%s" %(pURL,idString)
    tmp=noteString
    myfont=cxiFont()
    line1,tmp=myfont.chopBits(tmp,280)
    line2,tmp=myfont.chopBits(tmp,280)
    line3,tmp=myfont.chopBits(tmp,280)
    line4,tmp=myfont.chopBits(tmp,140)
    line5,tmp=myfont.chopBits(tmp,140)

    pclcmds = "! 0 100 260 1" + EOL + \
      "TEXT 1" + pos(0,0) + date + seq  + EOL 
    if line1 != 0 :
        pclcmds=pclcmds + "TEXT 0" + pos(0,30) + line1 + EOL
    if line2 != 0 :
        pclcmds=pclcmds + "TEXT 0" + pos(0,60) + line2 + EOL
    if line3 != 0 :
        pclcmds=pclcmds + "TEXT 0" + pos(0,90) + line3 + EOL
    if line4 != 0 :
        pclcmds=pclcmds + "TEXT 0"+ pos(0,120) + line4 + EOL
    if line5 != 0 :
        pclcmds=pclcmds + "TEXT 0" + pos(0,150) + line5 + EOL
    bsize=myfont.calcBits(expertID)
    pclcmds=pclcmds + "DRAW_BOX" + pos(0,180) + idbox(bsize) + EOL +\
      "TEXT 0" + pos(5,185) + expertID + EOL + \
      "BARCODE DATAMATRIX (,F,,,1,~)" + apos(140,140) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

#################################################################################

"""
API: checkConnection
"""
def checkConnection(printer_addr,printer_port):
    ret = {}
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        rc=mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "Fail to open connection to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 

    ret={ CXI_RET : rc,
          CXI_MSG : "Success" }
    mycxi.closeLink()
    return ret

"""
API: checkConfig
"""
def checkConfig(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 
    data = checkConfig_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    cnt=re.findall("VARIABLE",data)
    expected=len(cnt)-1
    result=mycxi.config_recv(expected)
    mycxi.closeLink()
    rdata=extract_configs_(result)
    ret={ CXI_RET : expected,
          CXI_MSG : rdata }
    return ret 

"""
API: checkStatus
"""
def checkStatus(printer_addr, printer_port):
    ret = {}
    mycxi=cxiAccess(printer_addr, printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 
    data = checkStatus_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    rc,msg=mycxi.status_recv()
    mycxi.closeLink()
    ret={ CXI_RET : rc,
          CXI_MSG : msg }
    return ret 

"""
API: resetCxi
"""
def resetCxi(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 

    data = reset2Default_() + configure4SSXT_() + \
           calibrateNow_()+ powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()
    ret={ CXI_RET : 0,
          CXI_MSG : "Success" }
    return ret 

"""
API: resetBoxCxi
"""
def resetBoxCxi(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret

    data = reset2Default_() + configure4BOX_() + \
           calibrateNow_()+ powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()
    ret={ CXI_RET : 0,
          CXI_MSG : "Success" }
    return ret

"""
API: moveUp
"""
def moveUp(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 
    data = setPosition_(-5) + powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()
    ret={ CXI_RET : 0,
          CXI_MSG : "Success" }
    return ret 

"""
API: moveDown
"""
def moveDown(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 
    data = setPosition_(5) + powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()
    ret={ CXI_RET : 0,
          CXI_MSG : "Success" }
    return ret 

"""
API: moveLeft
"""
def moveLeft():
    global XSTART
    global YSTART
    XSTART = XSTART - 5
    if DEBUG:
        print "XSTART is ",XSTART
        print "YSTART is ",YSTART
    ret={ CXI_RET : 0,
          CXI_MSG : "Success, XSTART %s, YSTART %s"%(XSTART,YSTART) }
    return ret 

"""
API: moveRight
"""
def moveRight():
    global XSTART 
    global YSTART
    XSTART = XSTART + 5
    if DEBUG:
        print "XSTART is ",XSTART
        print "YSTART is ",YSTART
    ret={ CXI_RET : 0,
          CXI_MSG : "Success, XSTART %s, YSTART %s"%(XSTART,YSTART) }
    return ret 

"""
API: makeSliceLabel
expecting to see
P00002
P00001
R00000
"""
def makeSliceLabel(printer_addr,printer_port,date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString):
    ret={}
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : 0,
              CXI_MSG : "Fail to open connection to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 

    data = checkStatus_()
    mycxi.send(data)
    okay,msg=mycxi.status_recv()
    if okay != 1: 
        if DEBUG:
            print 'printer is not well..'
        mycxi.closeLink()
        ret={ CXI_RET : 0,
              CXI_MSG : "Printer is not feeling well (%s,%s),%s"%(printer_addr,printer_port,msg) }
        return ret

    if DEBUG:
       print 'calling-> makeSliceLabel_',(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString)
    data = makeSliceLabel_(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString)
    print 'sending->\n', data
    mycxi.send(data)
    rcount,msg=mycxi.label_recv()
    if rcount >= 1:
        ret={ CXI_RET : rcount,
              CXI_MSG : "Success" }
    else:
        if DEBUG:
             print "failed to print a slide label at (%s,%s),%s"%(printer_addr,printer_port,msg)
        ret={ CXI_RET : 0,
              CXI_MSG : "%s,%s: %s" %(printer_addr,printer_port,msg) }
    mycxi.closeLink()
    return ret

"""
API: makeBoxLabel
"""
def makeBoxLabel(printer_addr,printer_port,date,genotype,expertID,disNum,pURL,idString,noteString):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : 0,
              CXI_MSG : "Fail to open connection to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret

    data = checkStatus_()
    mycxi.send(data)
    okay,msg=mycxi.status_recv()
    if okay != 1: 
        print 'printer is not well..'
        mycxi.closeLink()
        ret={ CXI_RET : 0,
              CXI_MSG : "Printer is not feeling well (%s,%s),%s"%(printer_addr,printer_port,msg) }
        return ret

    if DEBUG:
        print 'calling -> makeBoxLabel_',(date,genotype,expertID,disNum,pURL,idString,noteString)
    data = makeBoxLabel_(date,genotype,expertID,disNum,pURL,idString,noteString)
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    rcount,msg=mycxi.label_recv()
    if rcount >= 1:
        ret={ CXI_RET : rcount,
              CXI_MSG : "Success" }
    else:
        if DEBUG:
            print "failed to print a box label at (%s,%s),%s"%(printer_addr,printer_port,msg)
        ret={ CXI_RET : 0,
              CXI_MSG : "%s,%s:box label, %s" %(printer_addr,printer_port,msg) }
    mycxi.closeLink()
    return ret

"""
API: makeNoteLabel
"""
def makeNoteLabel(printer_addr,printer_port,date,expertID,seqNum,pURL,idString,noteString):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : 0,
              CXI_MSG : "Fail to open connection to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret
    data = checkStatus_()
    mycxi.send(data)
    okay,msg=mycxi.status_recv()
    if okay != 1: 
        if DEBUG:
            print 'printer is not well..'
        mycxi.closeLink()
        ret={ CXI_RET : 0,
              CXI_MSG : "Printer is not feeling well (%s,%s),%s"%(printer_addr,printer_port,msg) }
        return ret

    if DEBUG:
        print 'calling -> makeNoteLabel_',(date,expertID,seqNum,pURL,idString,noteString)
    data = makeNoteLabel_(date,expertID,seqNum,pURL,idString,noteString)
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    rcount,msg =mycxi.label_recv()
    if rcount >= 1:
        ret={ CXI_RET : rcount,
              CXI_MSG : "Success" }
    else:
        if DEBUG:
            print "failed to print a note label at (%s,%s),%s" % (printer_addr,printer_port,msg)
        ret={ CXI_RET : 0,
              CXI_MSG : "%s,%s:note label, %s" %(printer_addr,printer_port,msg) }
    mycxi.closeLink()
    return ret


"""
API: printTestSample
API: printBoxTestSample
"""
def printSample(box,printer_addr,printer_port):
    ret = {}
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : 0,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 

    data = checkStatus_()
    mycxi.send(data)
    okay,msg=mycxi.status_recv()
    if okay != 1: 
        if DEBUG:
            print 'printer is not well..'
        mycxi.closeLink()
        ret={ CXI_RET : 0,
              CXI_MSG : "printer is not well (%s,%s),%s"%(printer_addr,printer_port,msg) }
        return ret 

    if (box==1):
        data = testBoxLabel_()
    else:
        data = testLabel_()

    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    rcount,msg=mycxi.label_recv()
    if rcount != 1:
        if DEBUG:
            print "failed to print the sample label at (%s,%s)"%(printer_addr,printer_port)
        ret={ CXI_RET : 0,
              CXI_MSG : "%s,%s:note label, %s" %(printer_addr,printer_port,msg) }
    else:
        ret={ CXI_RET : 1,
              CXI_MSG : "Success" }
    mycxi.closeLink()
    return ret 

def printTestSample(printer_addr,printer_port):
    return printSample(0, printer_addr, printer_port)

def printBoxTestSample(printer_addr,printer_port):
    return printSample(1, printer_addr, printer_port)

"""
xAPI: resetNetwork
if LAB:
    resetNetwork(printer_addr,printer_port,"10.102.237.47","255.255.255.0","10.102.237.254")
if ISI:
    resetNetwork(printer_addr,printer_port,"128.9.129.113","255.255.240.0","128.9.128.7")
##mei home
if MEI:
    resetNetwork(printer_addr,printer_port,"192.168.1.116","255.255.250.0","192.168.1.1")
"""
def XresetNetwork(printer_addr,printer_port,ip,netmask,gateway):
    mycxi=cxiAccess(printer_addr,printer_port)
    mycxi.extendtimeout(100)
    data=resetConnectVars_(ip, netmask, gateway)
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()

"""
xAPI: justCalibrate
"""
def XjustCalibrate(printer_addr, printer_port):
    mycxi=cxiAccess(printer_addr, printer_port)
    try:
        mycxi.openLink()
    except:
        return 0
    data = calibrateNow_() + powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()

"""
xAPI: cycleIt
"""
def XcycleIt(printer_addr,printer_port):
    mycxi=cxiAccess(printer_addr,printer_port)
    try:
        mycxi.openLink()
    except:
        return 0
    data = powerCycle_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()



