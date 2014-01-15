#!/usr/bin/env python

##
##  /svn-src/printer/src/cxi/cxifont.py
##

import sys

DEBUG = 0
DEFAULT_BIT_SIZE=15

default_bit_list = {
"A":22, "B":22, "C":22, "D":22, "E":22, "F":22, "G":22, "H":22, "I":10,
"J":18, "K":22, "L":22, "M":28, "N":22, "O":22, "P":22, "Q":22, "R":22,
"S":22, "T":22, "U":22, "V":22, "W":28, "X":22, "Y":22, "Z":22, "1":10,
"2":20, "3":20, "4":20, "5":20, "6":20, "7":20, "8":20, "9":20, "9":20,
"0":20, "a":20, "b":20, "c":20, "d":20, "e":20, "f":18, "g":20, "h":20,
"i":20, "j":20, "k":20, "l":20, "m":20, "n":20, "o":20, "p":20, "q":20,
"r":18, "s":20, "t":18, "u":20, "v":20, "w":22, "x":20, "y":20, "z":20 }

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
                   print "Can not open %s to read!!" % self.file 
               raise

           rawlist=fptr.readlines()
           if DEBUG:
               print "What is read.."
               print rawlist
   
           for i in rawlist:
               a=i.split("=")
               key=a[0].strip()
               val=a[1].rstrip()
               if val.isdigit():
                  self.bit_list[str(key)]=int(val)
               else:
                  if DEBUG:
                    print "Could not fill in for %s" % key
           fptr.close()
       else:
           self.bit_list=default_bit_list
       if DEBUG:
           print "Final bit list"
           print self.bit_list

    def __del__(self):
       if DEBUG:
           print "wrapping up cxiFont"

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
       return total

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

def main():
    print "font file name?"
    tmp = sys.stdin.readline()
    try :
        cptr=cxiFont(tmp.rstrip())
    except :
        return 1

    if cptr:
        print "for box?(y/n)"
        tmp = sys.stdin.readline()
        if (tmp[0]=='y') :
            box=1
        else:
            box=0
        print "give me a string?"
        input = sys.stdin.readline()
    
        if box:
            print "==>chopping it for box label"
            limit=560
        else:
            print "==>chopping it for slice label"
            limit=280
    
        while 1:
            chopline,leftover=cptr.chopBits(input,limit)
            if(chopline):
               print chopline
               input=leftover
            else:
               break
    return 0

if __name__ == "__main__":
    main()


