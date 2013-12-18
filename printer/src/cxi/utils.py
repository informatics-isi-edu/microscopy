#!/usr/bin/env python

##
##  /svn-src/printer/src/cxi/utils.py
##

import sys
import socket
import re
from time import sleep

LAB=0
ISI=1
MEI=0

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
"DARKNESS":"100",
"RECALIBRATE":"ON",
"PRINT_MODE":"TT",
"REPORT_LEVEL":"1",
"REPORT_TYPE":"SERIAL",
"ETHERNET GARP":"5",
"USER_FEEDBACK":"ON",
"ETHERNET RTEL":"ON",
"ETHERNET RTEL TIMEOUT":"10"
}

##"SLEEP_AFTER":"0",
##"ETHERNET RTEL TIMEOUT":"30"

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
       except socket.error:
           print "Fail to connect to %s, power cycle the printer" % self.addr
           ## force fail on assert
           assert(0)
       else:
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
def yloc(delta):
    global YSTART
    return str(YSTART+(delta))

def xloc(delta):
    global XSTART
    return str(XSTART+(delta))

def pos(xdelta, ydelta):
    ret=SPACE + xloc(xdelta) + SPACE + yloc(ydelta) + SPACE
    return ret

def apos(x, y):
    ret=SPACE + str(x) + SPACE + str(y) + SPACE
    return ret

def chop(s, width):
    if DEBUG:
        print 'chop(%s)' % s
    if s == 0:
        return 0, 0;
    if len(s)<= width:
        return s, 0;
    if s[width].isspace():
        p=s[0:width]
        return p, s[width+1:];
    else:
        idx=s[0:width].rfind(' ')
        if idx <= 0:
            n=s[width:]
            idx=n.find(' ')
            if idx <= 0:
                return s[0:width], s[width:]
            else:
                return s[0:width], n[idx+1:]
        p=s[0:idx]
        return p, s[idx+1:]

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
    sample_pUrl="http://purl.org/usc-cirm"
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
"BARCODE DATAMATRIX (,F,,,1.2,~) 140 140" + EOL + "~%40s~"%(purl) + EOL \
"STRING 8X8(1,1,1,2) 20 240 " + guid + EOL \
"STRING 8X8(1,1,1,2) 20 240 " + idString + EOL \
"""
def makeSliceLabel_(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString):
    seq="% 4d" %(seqNum)
    rev="rev:%03d" %revNum
    purl="%s/slide?id=%s" %(pURL,idString)
    pclcmds = "! 0 100 260 1" + EOL + \
      "TEXT 1" + pos(0,0) + date + seq +EOL +  \
      "TEXT 1" + pos(0,30) + genotype + EOL + \
      "TEXT 1" + pos(0,60) + antibody + EOL + \
      "TEXT 1" + pos(0,90) + experiment + EOL +  \
      "TEXT 1" + pos(0,135) + rev + EOL + \
      "DRAW_BOX" + pos(0,180) + "65 40 3" + EOL +\
      "TEXT 0" + pos(5,185) + expertID + EOL + \
      "BARCODE DATAMATRIX (,F,,,1,~)" +apos(140,140) + EOL + "~%70s~"%(purl) + EOL + \
      "END" + EOL
    return pclcmds

"""
"""
def makeBoxLabel_(date,genotype,expertID,disNum,pURL,idString,noteString):
    purl="%s/box?id=%s" %(pURL,idString)
    tmp=noteString
    ltmp=noteString.lower()
    if tmp == ltmp:
        line1,tmp=chop(tmp,17)
    else:   
        line1,tmp=chop(tmp,14)
    pclcmds = "! 0 100 260 1" + EOL + \
      "TEXT 1" + pos(0,0) + date + EOL +  \
      "DRAW_BOX" + pos(185,-5) + "30 30 3" + EOL +\
      "STRING 18X23" + pos(190,0) + disNum +EOL +  \
      "TEXT 1" + pos(0,35) + genotype + EOL
    if line1 != 0:
        pclcmds=pclcmds+ "TEXT 0" + pos(0,70) + line1 + EOL
    pclcmds=pclcmds + \
      "TEXT 1" + pos(0,135) + "???" + EOL +\
      "DRAW_BOX" + pos(0,180) + "65 40 3" + EOL +\
      "TEXT 0" + pos(5,185) + expertID + EOL + \
      "BARCODE DATAMATRIX (,F,,,1,~)" + apos(140,140) + EOL + "~%70s~"%(purl) + EOL + \
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
    ltmp=noteString.lower()
    if tmp == ltmp:
        line1,tmp=chop(tmp,17)
        line2,tmp=chop(tmp,17)
        line3,tmp=chop(tmp,17)
        line4,tmp=chop(tmp,8)
        line5,tmp=chop(tmp,8)
    else:
        line1,tmp=chop(tmp,14)
        line2,tmp=chop(tmp,14)
        line3,tmp=chop(tmp,14)
        line4,tmp=chop(tmp,7)
        line5,tmp=chop(tmp,7)

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
    pclcmds=pclcmds + "DRAW_BOX" + pos(0,180) + "65 40 3" + EOL +\
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
xAPI: resetNetwork
if LAB:
    resetNetwork(printer_addr,printer_port,"10.102.237.47","255.255.255.0","10.102.237.254")
if ISI:
    resetNetwork(printer_addr,printer_port,"128.9.129.113","255.255.240.0","128.9.128.7")
##mei home
if MEI:
    resetNetwork(printer_addr,printer_port,"192.168.1.108","255.255.250.0","192.168.1.1")
"""
def resetNetwork(printer_addr,printer_port,ip,netmask,gateway):
    mycxi=cxiAccess(printer_addr,printer_port)
    mycxi.extendtimeout(100)
    data=resetConnectVars_(ip, netmask, gateway)
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    mycxi.closeLink()

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
xAPI: justCalibrate
"""
def justCalibrate(printer_addr, printer_port):
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
def cycleIt(printer_addr,printer_port):
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

"""
API: printTestSample
"""
def printTestSample(printer_addr,printer_port):
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
    rdata=extract_configs(result)
    ret={ CXI_RET : expected,
          CXI_MSG : rdata }
    return ret 

def extract_configs(data):
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


#####################################################################
def test(printer_addr,printer_port):
    global DEBUG
    DEBUG = 1
    usage=EOL + "Please select," + EOL \
              + "0)check connection" + EOL \
              + "1)get current status" + EOL \
              + "2)get config setting" + EOL \
              + "3)reset printer" + EOL \
              + "4)shift up/down" + EOL \
              + "5)shift left/right" + EOL \
              + "n)make note label" + EOL \
              + "s)make slice label" + EOL \
              + "b)make box label" + EOL \
              + "t)make test sample" + EOL \
              + "x)exit"
    while 1 :
        print usage
        tmp = sys.stdin.readline()
        
        ## secret sleepy test
        if tmp[0]=='X':
            test_sleep(printer_addr,printer_port)
            break

        if tmp[0]=='S':
            test_special(printer_addr,printer_port)
            break

        if tmp[0]=='t':
            printTestSample(printer_addr,printer_port)
            continue

        if tmp[0]=='n':
            cnt=0
            printed=makeNoteLabel(printer_addr,printer_port,"2013-10-15","RES",38,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000","this is a note string that needs to be in there")
            cnt+=printed[CXI_RET]
            printed=makeNoteLabel(printer_addr,printer_port,"2013-10-15","RES",38,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000","this is a very very long note string that will go on and on and on and on")
            printed=makeNoteLabel(printer_addr,printer_port,"2013-10-15","RES",39,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-39-000","xbbbbbbbbbbbbbbbbbx chubby")
            cnt+=printed[CXI_RET]
            print "# of note labels got printed is ",cnt
            if cnt == 0:
                print printed[CXI_MSG]
            continue

        if tmp[0]=='s':
            cnt=0
            printed=makeSliceLabel(printer_addr,printer_port,"2013-10-15", "wnt1creZEGG", "AntibodyX", "ExperimentX","RES", 38,0,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000")
            cnt+=printed[CXI_RET]
## another one
            printed=makeSliceLabel(printer_addr,printer_port,"2013-10-15", "wnt1creZEGG", "AntibodyX", "ExperimentX","RES", 39,0,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-39-000")
            cnt+=printed[CXI_RET]
            print "# of slice labels got printed is ",cnt
            if cnt == 0:
                print printed[CXI_MSG]
            continue

        if tmp[0]=='b':
            cnt=0
            printed=makeBoxLabel(printer_addr,printer_port,"2013-10-15", "wnt1creZEGG", "RES","0","http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0","box note goes here")
            cnt+=printed[CXI_RET]
            print "# of box labels got printed is ",cnt
            if cnt == 0:
                print printed[CXI_MSG]
            continue

        try:
            data = int(tmp[0])
        except :
            break

        if  (data > 9) | (data < 0):
           break

        if data == 0 :
           ret=checkConnection(printer_addr,printer_port)
           if ret[CXI_RET] == 1 :
               print "Connection okay!"
        elif data == 1 :
           checkStatus(printer_addr,printer_port)
        elif data == 2 :
           ret=checkConfig(printer_addr,printer_port)
        elif data == 3 :
           resetCxi(printer_addr,printer_port)
        elif data == 4 :
           up=tmp.find("up")
           if up > 0:
               moveUp(printer_addr,printer_port)
           else:
               moveDown(printer_addr,printer_port)
        elif data == 5 :
           left=tmp.find("left")
           if left > 0:
               moveLeft()
           else:
               moveRight()
        else:
           print "bad place!!"

def test_sleep(printer_addr,printer_port):
    global DEBUG
    DEBUG = 1
    now_time = 0
    print "start checking the sleepy cxi"
    ret=checkConnection(printer_addr,printer_port)
    while ret[CXI_RET]==1 :
        print "at %d" % now_time
        print "  --Connection okay!\n"
        now_time += 20
        sleep(20)
        checkStatus(printer_addr,printer_port)
        ret=checkConnection(printer_addr,printer_port)

def test_special(printer_addr,printer_port):
    global DEBUG
    DEBUG = 1
    mycxi=cxiAccess(printer_addr, printer_port)
    try:
        mycxi.openLink()
    except:
        ret={ CXI_RET : -1,
              CXI_MSG : "can not connect to printer (%s,%s)"%(printer_addr,printer_port) }
        return ret 
    data = checkFirmware_()
    if DEBUG:
        print 'sending->\n', data
    mycxi.send(data)
    rc,msg=mycxi.status_recv()
    mycxi.closeLink()
    ret={ CXI_RET : rc,
          CXI_MSG : msg }
    print 'firmware info:%s'%msg
    return ret 

if __name__ == "__main__":
    if MEI:
        test("192.168.1.108",9100)
    if ISI:
        test("mycxi.isi.edu",9100)
    if LAB:
        test("labelprnter01.mgmt.usc.edu",9100)


