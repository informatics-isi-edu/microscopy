#!/usr/bin/env python3

##
##  /svn-src/printer/src/cxi/cxifont.py
##

import sys

DEBUG = 0
DEFAULT_BIT_SIZE=10
SPACE = " "
EOL = "\r\n"

default_bit_list = {
"A":21, "B":22.4, "C":23.8, "D":23.8, "E":21, "F":19.6, "G":25.2, "H":23.8,
"I":8.5, "J":16, "K":21, "L":18.2, "M":28, "N":23.8, "O":25.2, "P":21, 
"Q":25.2, "R":23.8, "S":21, "T":19.6, "U":22, "V":21, "W":28, "X":21, 
"Y":22.4, "Z":19.6, "1":10, "2":16.8, "3":16.8, "4":16.8, "5":16.8, "6":16.8,
"7":16.8, "8":16.8, "9":16.8, "9":16.8, "0":16.8, "a":16.8, "b":18, "c":16,
"d":18, "e":20, "f":9.5, "g":18, "h":18, "i":8.5, "j":8.5, "k":16, "l":8.5, 
"m":20, "n":18, "o":16.8, "p":18, "q":18, "r":11, "s":16, "t":9.5, "u":18, 
"v":16, "w":23.8, "x":16, "y":16, "z":16 }

#####################################################################
class cxiFont():
    """ manage and process the printable size of any input string """
    def __init__(self, file=""):
       if file != "":
           self.file=file
           self.bit_list={}
           try:
               fptr=open(self.file,"r")
           except:
               if DEBUG:
                   print ("Can not open %s to read!!" % self.file) 
               raise

           rawlist=fptr.readlines()
           if DEBUG:
               print ("What is read..")
               print (rawlist)
   
           for i in rawlist:
               a=i.split("=")
               key=a[0].strip()
               val=a[1].rstrip()
               if val.isdigit():
                  self.bit_list[str(key)]=int(val)
               else:
                  if DEBUG:
                    print ("Could not fill in for %s" % key)
           fptr.close()
       else:
           self.bit_list=default_bit_list
       if DEBUG:
           print ("Final bit list")
           print (self.bit_list)

    def __del__(self):
       if DEBUG:
           print ("wrapping up cxiFont")

    def getBits(self,key):
       if self.bit_list.has_key(key):
          return self.bit_list[str(key)]
       return DEFAULT_BIT_SIZE

    def calcBits(self,input):
       sz=len(input)
       if sz==0:
          return 0
       idx=0
       total=0;
       while(idx < sz) : 
           total += self.getBits(input[idx])
           idx += 1
       val=int(total)
       if val<total:
           val+=1
       return val

    def chopBits(self,input,limit):
       sz=len(input)
       if (sz==0 ) or (limit==0):
           return 0, input
       total=0
       idx=0
       sidx=0
       while (idx < sz and total < limit) :
           if input[idx].isspace():
               sidx=idx
           bits=self.getBits(input[idx]) 
           if( total+bits > limit):
               break
           total=total+bits
           idx += 1
       if idx == sz:
           return input[0:idx], "" 
       if input[idx].isspace() or sidx==0:
           return input[0:idx], input[idx:]
       else:
           return input[0:sidx], input[sidx+1:]

#####################################################################
## utility routines
def apos(xval, yval):
    ret= SPACE  + str(xval) + SPACE + str(yval) + SPACE
    return ret

def chartype(c):
    i=0
    ret=""
    while i <=10:
       ret=ret+str(c)
       i+=1
    ret=ret+" "+str(c)
    return ret

####################################################
# grouping of various char in TEXT 0 format (stored in 'font_file')
# W is pegged at 28 bits
#  W i j l I f t r W
#  W c s k v y x z J W
#  W b d g h n p q u W
#  W a o 1 2 3 4 5 6 7 8 9 0 W
#  W L T Z F X P S A E K V W
#  W Y B w C D H N R G O Q M
def makeFontSampleLabel(infile):
    pclcmds=""
    try:
       fptr=open(infile,"r")
    except:
       if DEBUG:
           print ("Can not open %s to read!!" % self.file)
    lines=fptr.readlines()
    if DEBUG:
       print ("What is read..")
       print (aline)

    for aline in lines:
        if aline[0] == "x" :
            continue
        pclcmds = pclcmds + "! 0 100 300 1" + EOL + \
           "DRAW_BOX"+ apos(10,5) +"580 280 4" + EOL
        idx=5

        alist=aline.split(" ")
        for j in alist:
            j.strip() 
            pclcmds = pclcmds + \
               "TEXT 0"+ apos(10,idx)  + chartype(j[0]) + EOL
            idx+=20
        pclcmds=pclcmds + "END" + EOL
    return pclcmds

#####################################################################
## local testing main
def main():
    print ("font file name?")
    tmp = sys.stdin.readline()
    try :
        cptr=cxiFont(tmp.rstrip())
    except :
        return 1

    if cptr:
        print ("for box?(y/n)")
        tmp = sys.stdin.readline()
        if (tmp[0]=='y') :
            box=1
        else:
            box=0
        print ("give me a string?")
        input = sys.stdin.readline()
    
        if box:
            print ("==>chopping it for box label")
            limit=560
        else:
            print ("==>chopping it for slice label")
            limit=280
    
        while 1:
            chopline,leftover=cptr.chopBits(input,limit)
            if(chopline):
               print (chopline)
               input=leftover
            else:
               break
    return 0

if __name__ == "__main__":
    main()


