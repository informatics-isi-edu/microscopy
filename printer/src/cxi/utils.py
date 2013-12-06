#!/usr/bin/env python

import sys
import socket
import re
from time import sleep

DEBUG = 1
# initial XSTART (for shift left or right)
XSTART = 10
YSTART = 10
SPACE = " "

#####################################################################
class cxiAccess():
    """ socket link up with a cxi printer """
#    def __init__(self, addr='192.168.1.115', port=9100):
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

    def openLink(self, exit=1) :
       save_t=self.cxi.gettimeout()
       self.cxi.settimeout(10.0)
       if DEBUG :
          print "ip is ", self.addr_ip
          print "addr is ", self.addr
       try:
           self.cxi.connect((self.addr_ip,self.port))
       except socket.error:
           print "Fail to connect to %s, power cycle the printer" % self.addr
           if exit:
               sys.exit()
           else:
               return 0
       else:
           self.isOpen=1
       self.cxi.settimeout(save_t)
       return 1

    def closeLink(self):
       if self.isOpen==1 :
           self.cxi.close()
       self.isOpen=0

    def send(self, data):
       sent = self.cxi.send(data)
       if DEBUG:
           print "send: done"
       if sent == 0:
          print "BAD, socket connect closed"

    def config_recv(self, expected):
       data="" 
       while 1 :
           try:
               tmp = self.cxi.recv(1024)
           except socket.error:
               print "ERROR, socket got disconnected"
               break
           if tmp == 0:
               break
           if len(tmp) == 0:
               break
           data += tmp
           cnt=re.findall("\r\n",data)
           if len(cnt) == expected:
               break
           if DEBUG:
               print "-> ",(len(tmp), tmp)
       if DEBUG:
           print "recv: ", data
       return data

    def label_recv(self):
       printed = 0
       data = ""
       while 1 :
           try:
               tmp = self.cxi.recv(1024)
           except socket.error:
               print "ERROR, socket got disconnected"
               break
           if tmp == 0:
               break
           if len(tmp) == 0:
               break
           if re.search("^ERROR", tmp) != None:
               return -1
           data += tmp
           if re.search("^R00000",tmp) != None:
               break

       if len(data) == 0:
           return -1
       done=re.findall("P[0-9]+",data)
       printed=len(done)

       return printed

#####################################################################
## utility routines
def yloc(delta):
    global YSTART
    return str(YSTART+(delta))

def xloc(delta):
    global XSTART
    return str(XSTART+(delta))

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
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE RESET " + "\n" + \
      "END " + "\n"
    return pclcmds

"""
force a calibration, should press feed button or print a sample label

! 0 0 0 0
VARIABLE INDEX SETTING CALIBRATE
END
"""
def calibrateNow_():
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE INDEX SETTING CALIBRATE " + "\n" + \
      "END " + "\n"
    return pclcmds

"""
reset ethernet link
! 0 0 0 0
VARIABLE ETHERNET IP 128.9.129.113
VARIABLE NETMASK 255.255.240.0
VARIABLE GATEWAY 128.9.128.7
VARIABLE WRITE
VARIABLE ETHERNET RESET
END
"""
def resetConnectVars_(ip, netmask, gateway):
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE ETHERNET IP " + ip + "\n" + \
      "VARIABLE NETMASK " + netmask + "\n" + \
      "VARIABLE GATEWAY " + gateway + "\n" + \
      "VARIABLE WRITE " + "\n" +  \
      "VARIABLE ETHERNET RESET " + "\n" + \
      "END" + "\n"
    return pclcmds

def resetConnect_():
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE ETHERNET RESET " + "\n" + \
      "END" + "\n"
    return pclcmds

"""
extract some configuration values

! 0 0 0 0
VARIABLE DARKNESS ?
VARIABLE RECALIBRATE ?
VARIABLE PRINT_MODE ?
VARIABLE ERROR_LEVEL ?
VARIABLE FEED_TYPE ?
VARIABLE WIDTH ?
VARIABLE GAP_SIZE ?
VARIABLE RECALIBRATE ?
VARIABLE PRINT_MODE ?
VARIABLE USER_FEEDBACK ?
VARIABLE REPORT_LEVEL ?
VARIABLE REPORT_TYPE ?
VARIABLE USER_FEEDBACK ?
VARIABLE WRITE
END
"""
def checkConfig_():
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE DARKNESS ? " + "\n" +  \
      "VARIABLE RECALIBRATE ? " + "\n" +  \
      "VARIABLE PRINT_MODE ? " + "\n" +  \
      "VARIABLE ERROR_LEVEL ? " + "\n" +  \
      "VARIABLE FEED_TYPE ? " + "\n" +  \
      "VARIABLE WIDTH ? " + "\n" +  \
      "VARIABLE GAP_SIZE ? " + "\n" +  \
      "VARIABLE RECALIBRATE ? " + "\n" +  \
      "VARIABLE PRINT_MODE ? " + "\n" +  \
      "VARIABLE USER_FEEDBACK ? " + "\n" +  \
      "VARIABLE REPORT_LEVEL ? " + "\n" +  \
      "VARIABLE REPORT_TYPE ?" + "\n" +  \
      "VARIABLE ETHERNET IP ? " + "\n" + \
      "VARIABLE WRITE " + "\n" +  \
      "END" + "\n"
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
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE POSITION " + str(pos) + "\n" + \
      "VARIABLE WRITE " + "\n" +  \
      "END" + "\n"
    return pclcmds

"""
setup for Data General's StainerShield XT label
7/8 x 7/8, 1/8 gap, on 1"x1" backing, Thermal Transfer mode

! 0 0 0 0
VARIABLE FEED_TYPE GAP
VARIABLE WIDTH 90
VARIABLE GAP_SIZE 19
VARIABLE DARKNESS 300
VARIABLE RECALIBRATE ON
VARIABLE PRINT_MODE TT
VARIABLE SLEEP_AFTER 0
VARIABLE REPORT_LEVEL 1
VARIABLE REPORT_TYPE SERIAL
VARIABLE USER_FEEDBACK ON
VARIABLE WRITE
END
"""
def configure4SSXT_() :
    pclcmds = "! 0 0 0 0" + "\n" + \
      "VARIABLE FEED_TYPE GAP " + "\n" +  \
      "VARIABLE WIDTH 90 " + "\n" +  \
      "VARIABLE GAP_SIZE 19 " + "\n" +  \
      "VARIABLE DARKNESS 300 " + "\n" +  \
      "VARIABLE RECALIBRATE ON " + "\n" +  \
      "VARIABLE PRINT_MODE TT " + "\n" +  \
      "VARIABLE SLEEP_AFTER 0" + "\n" +  \
      "VARIABLE REPORT_LEVEL 1" + "\n" +  \
      "VARIABLE REPORT_TYPE SERIAL" + "\n" +  \
      "VARIABLE USER_FEEDBACK ON" + "\n" +  \
      "VARIABLE WRITE" + "\n" +  \
      "END" + "\n"
    return pclcmds

"""
force a power cycle after a lockup
23 23 23 23 23 67 76 69 65 82 23 23 23 23 23
"""
def powerCycle_():
    pclcmds= "%c%c%c%c%cclear%c%c%c%c%c" % (0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17, 0x17)
    return pclcmds

"""
wake a sleeping printer
C....C, 80 of them
"""
def wakeUp_():
    pclcmds = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"
    return pclcmd

"""
a test label
"""
def testLabel_():
    global XSTART
    sample_idString="20131108-wnt1creZEG-RES-0-38-000"
    sample_pUrl="http://purl.org/usc-cirm"
    purl="%s/slide?id=%s" %(sample_pUrl,sample_idString)
    pclcmds = "! 0 100 240 1" + "\n" + \
      "DRAW_BOX "+ xloc(0) + SPACE + yloc(0) + " 240 240 4 " + "\n" +\
      "TEXT 1 "+ xloc(10) + SPACE + yloc(5) + " ABACEFG " + "\n" +  \
      "TEXT 1 "+ xloc(10) + SPACE + yloc(35) + " 12345 " + "\n" +  \
      "TEXT 1 "+ xloc(10) + SPACE + yloc(65) + " abcefg " + "\n" +  \
      "TEXT 1 "+ xloc(10) + SPACE + yloc(95) +" MNOPQ " + "\n" +  \
      "BARCODE DATAMATRIX (,F,,,1,~) 140 140" + "\n" + "~%70s~"%(purl) + "\n" \
      "END" + "\n"
    return pclcmds

"""
"BARCODE DATAMATRIX (,F,,,1.2,~) 140 140" + "\n" + "~%40s~"%(purl) + "\n" \
"STRING 8X8(1,1,1,2) 20 240 " + guid + "\n" \
"STRING 8X8(1,1,1,2) 20 240 " + idString + "\n" \
"""
def makeSliceLabel_(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString):
    global XSTART
    seq="% 4d" %(seqNum)
    rev="rev:%03d" %revNum
    purl="%s/slide?id=%s" %(pURL,idString)
    pclcmds = "! 0 100 260 1" + "\n" + \
      "TEXT 1 "+str(XSTART)+" 10 " + date + seq +"\n" +  \
      "TEXT 1 "+str(XSTART)+" 40 " + genotype + "\n" + \
      "TEXT 1 "+str(XSTART)+" 70 " + antibody + "\n" + \
      "TEXT 1 "+str(XSTART)+" 100 " + experiment +"\n" +  \
      "TEXT 1 "+str(XSTART)+" 145 " + rev + "\n" + \
      "DRAW_BOX "+str(XSTART)+" 190 65 40 3 " + "\n" +\
      "TEXT 0 " +str(XSTART+5)+ " 195 " + expertID + "\n" + \
      "BARCODE DATAMATRIX (,F,,,1,~) 140 140" + "\n" + "~%70s~"%(purl) + "\n" + \
      "END" + "\n"
    return pclcmds

"""
"""
def makeBoxLabel_(date,genotype,expertID,disNum,pURL,idString,noteString):
    global XSTART
    purl="%s/box?id=%s" %(pURL,idString)
    tmp=noteString
    ltmp=noteString.lower()
    if tmp == ltmp:
        line1,tmp=chop(tmp,17)
    else:   
        line1,tmp=chop(tmp,14)
    pclcmds = "! 0 100 260 1" + "\n" + \
      "TEXT 1 "+str(XSTART)+" 10 " + date +"\n" +  \
      "DRAW_BOX "+str(XSTART+185)+ " 5 30 30 3 " + "\n" +\
      "STRING 18X23 "+str(XSTART+190)+ " 10 " + disNum +"\n" +  \
      "TEXT 1 "+str(XSTART)+" 45 " + genotype + "\n"
    if line1 != 0:
        pclcmds=pclcmds+ "TEXT 0 "+str(XSTART)+" 80 "+  line1 + "\n"
    pclcmds=pclcmds + \
      "TEXT 1 "+str(XSTART)+" 145 ??? " + "\n" +\
      "DRAW_BOX "+str(XSTART)+" 190 65 40 3 " + "\n" +\
      "TEXT 0 "+str(XSTART+5)+" 195 " + expertID + "\n" + \
      "BARCODE DATAMATRIX (,F,,,1,~) 140 140" + "\n" + "~%70s~"%(purl) + "\n" + \
      "END" + "\n"
    return pclcmds

"""
"STRING 8X8(1,1,1,2) 20 240 " + guid + "\n" \
"STRING 18X23(2,1,1,1) 10 40 " + line1 + "\n" \
"ULTRA_FONT A30(4,0,0) 10 40 " + line1 + "\n" \
"""
def makeNoteLabel_(date,expertID,seqNum,pURL,idString,noteString):
    global XSTART
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

    pclcmds = "! 0 100 260 1" + "\n" + \
      "TEXT 1 "+str(XSTART)+" 10 " + date + seq  + "\n" 
    if line1 != 0 :
        pclcmds=pclcmds+ "TEXT 0 "+str(XSTART)+" 40 " + line1 + "\n"
    if line2 != 0 :
        pclcmds=pclcmds+"TEXT 0 "+str(XSTART)+" 70 " + line2 + "\n"
    if line3 != 0 :
        pclcmds=pclcmds+"TEXT 0 "+str(XSTART)+" 100 " + line3 + "\n"
    if line4 != 0 :
        pclcmds=pclcmds+"TEXT 0 "+str(XSTART)+" 130 " + line4 + "\n"
    if line5 != 0 :
        pclcmds=pclcmds+"TEXT 0 "+str(XSTART)+" 160 " + line5 + "\n"
    pclcmds=pclcmds+  "DRAW_BOX "+str(XSTART)+" 190 65 40 3 " + "\n" +\
      "TEXT 0 "+str(XSTART+5)+ " 195 " + expertID + "\n" + \
      "BARCODE DATAMATRIX (,F,,,1,~) 140 140" + "\n" + "~%70s~"%(purl) + "\n" + \
      "END" + "\n"
    return pclcmds

#################################################################################

"""
API: checkConnection
"""
def checkConnection():
    mycxi=cxiAccess()
    rc=mycxi.openLink(0)
    mycxi.closeLink()
    return rc

"""
API: makeSliceLabel
expecting to see
P00002
P00001
R00000
"""
def makeSliceLabel(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString):
    cnt=0
    mycxi=cxiAccess()
    mycxi.openLink()
    if DEBUG:
       print 'calling-> makeSliceLabel_',(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString)
    data = makeSliceLabel_(date,genotype,antibody,experiment,expertID,seqNum,revNum,pURL,idString)
    print 'sending->', data
    mycxi.send(data)
    ret=mycxi.label_recv()
    if ret == 1:
        cnt+=1
    else:
        print "ERROR, failed to print a slide label"
    mycxi.closeLink()
    return cnt

"""
API: makeBoxLabel
"""
def makeBoxLabel(date,genotype,expertID,disNum,pURL,idString,noteString):
    cnt=0
    mycxi=cxiAccess()
    mycxi.openLink()
    if DEBUG:
        print 'calling -> makeBoxLabel_',(date,genotype,expertID,disNum,pURL,idString,noteString)
    data = makeBoxLabel_(date,genotype,expertID,disNum,pURL,idString,noteString)
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    ret=mycxi.label_recv()
    if ret == 1:
       cnt+=1
    else:
       print "ERROR, failed to print a box label"
    mycxi.closeLink()
    return cnt

"""
API: makeNoteLabel
"""
def makeNoteLabel(date,expertID,seqNum,pURL,idString,noteString):
    cnt=0
    mycxi=cxiAccess()
    mycxi.openLink()
    if DEBUG:
        print 'calling -> makeNoteLabel_',(date,expertID,seqNum,pURL,idString,noteString)
    data = makeNoteLabel_(date,expertID,seqNum,pURL,idString,noteString)
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    ret=mycxi.label_recv()
    if ret == 1:
       cnt+=1
    else:
       print "ERROR, failed to print a note label"
    mycxi.closeLink()
    return cnt

"""
API: resetCxi
"""
def resetCxi():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = reset2Default_() + configure4SSXT_() \
           + calibrateNow_()+ powerCycle_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

"""
API: moveUp
"""
def moveUp():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = setPosition_(-5) + powerCycle_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

"""
API: moveDown
"""
def moveDown():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = setPosition_(5) + powerCycle_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

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

"""
API: justCalibrate
"""
def justCalibrate():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = calibrateNow_() + powerCycle_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

"""
API: cycleIt
"""
def cycleIt():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = powerCycle_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

"""
API: printSample
"""
def printSample():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = testLabel_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    mycxi.closeLink()

"""
API: checkConfig
"""
def checkConfig():
    mycxi=cxiAccess()
    mycxi.openLink()
    data = checkConfig_()
    if DEBUG:
        print 'sending->', data
    mycxi.send(data)
    cnt=re.findall("VARIABLE",data)
    expected=len(cnt)-1
    rc=mycxi.config_recv(expected)
    mycxi.closeLink()

#####################################################################
def test():
    while 1 :
        print "\nPlease select,\n  \
0)check connection\n  \
1)get config\n  \
2)reset printer\n  \
3)just calibrate\n  \
4)force power cycle\n  \
5)shift up/down\n  \
6)shift left/right\n  \
7)make note label\n  \
8)make slice label\n  \
9)make box label\n\
s)print sample\n\
x)exit"

        tmp = sys.stdin.readline()
        if tmp[0]=='s':
            printSample()
            continue
        try:
            data = int(tmp[0])
        except :
            break

        if  (data > 9) | (data < 0):
           break

        if data == 0 :
           rc=checkConnection()
           if rc == 1 :
               print "Connection okay!\n"
        elif data == 1 :
           checkConfig()
        elif data == 2 :
           resetCxi()
        elif data == 3 :
           justCalibrate()
        elif data == 4 :
           cycleIt()
        elif data == 5 :
           up=tmp.find("up")
           if up > 0:
               moveUp()
           else:
               moveDown()
        elif data == 6 :
           left=tmp.find("left")
           if left > 0:
               moveLeft()
           else:
               moveRight()
        elif data == 7 :
           printed=makeNoteLabel("2013-10-15","RES",38,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000","this is a note string that needs to be in there")
           printed=printed+makeNoteLabel("2013-10-15","RES",38,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000","this is a very very long note string that will go on and on and on and on")
           printed=printed+makeNoteLabel("2013-10-15","RES",39,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-39-000","xbbbbbbbbbbbbbbbbbx chubby")
           print "# of note labels got printed is ",printed
        elif data == 8 :
           printed=makeSliceLabel("2013-10-15", "wnt1creZEGG", "AntibodyX", "ExperimentX","RES", 38,0,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-38-000")
## another one
           printed=printed+makeSliceLabel("2013-10-15", "wnt1creZEGG", "AntibodyX", "ExperimentX","RES", 39,0,"http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0-39-000")
           print "# of slice labels got printed is ",printed
        elif data == 9 :
           printed=makeBoxLabel("2013-10-15", "wnt1creZEGG", "RES","0","http://purl.org/usc-cirm","20131108-wnt1creZEGG-RES-0","box note goes here")
           print "# of box labels got printed is ",printed
        else:
           print "bad place!!\n"

if __name__ == "__main__":
    test()


