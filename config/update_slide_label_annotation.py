#!/usr/bin/python

import sys
import traceback
import json
from deriva.core import ErmrestCatalog, AttrDict
from deriva.core.ermrest_model import builtin_types, Table, Column, Key, ForeignKey
from requests import HTTPError
from httplib import CONFLICT

def main(servername, credentialsfilename, catalog):
    
    def apply(catalog, goal):
        """
        Apply the goal configuration to live catalog
        """
        print 'applying...'
        counter = 0
        ready = False
        while ready == False:
            try:
                catalog.applyCatalogConfig(goal)
                ready = True
            except HTTPError as err:
                print err
                print err.errno
                if err.errno == CONFLICT:
                    et, ev, tb = sys.exc_info()
                    print 'Conflict Exception "%s"' % str(ev)
                    counter = counter + 1
                    if counter >= 5:
                        print '%s' % str(traceback.format_exception(et, ev, tb))
                        ready = True
                    else:
                        print 'Retrying...'
            except:
                et, ev, tb = sys.exc_info()
                print str(et)
                print 'Exception "%s"' % str(ev)
                print '%s' % str(traceback.format_exception(et, ev, tb))
                ready = True
            
    credentials = json.load(open(credentialsfilename))
    catalog = ErmrestCatalog('https', servername, catalog, credentials)
    try:
        goal = catalog.get_catalog_model()
    except AttributeError:
        try:
            goal = catalog.getCatalogModel()
        except:
            et, ev, tb = sys.exc_info()
            print 'got exception "%s"' % str(ev)
            print '%s' % str(traceback.format_exception(et, ev, tb))
            sys.exit(1)
            
    schema_name = 'Microscopy'
    table_name = 'Slide'
    column_name = 'Label'
    goal.column(schema_name, table_name, column_name).column_display.update({
        "compact": {"markdown_pattern": "{{#Label}}:::iframe [](/chaise/PrintLabel.html?label=/microscopy/printer/slide/job?{{{Label}}}){height=75 width=150 style=\"border-style: none; border-color: rgb(153, 153, 153);\" .iframe} \n:::{{/Label}}"},
        "detailed": {"markdown_pattern": "{{#Label}}:::iframe [](/chaise/PrintLabel.html?label=/microscopy/printer/slide/job?{{{Label}}}){height=75 width=150 style=\"border-style: none; border-color: rgb(153, 153, 153);\" .iframe} \n:::{{/Label}}"}
    })
    apply(catalog, goal)
    print 'Successfully updated the URL annotation for the column %s' % column_name
        
if __name__ == '__main__':
    assert len(sys.argv) == 4, "required arguments: servername credentialsfilename catalog"
    servername = sys.argv[1]
    credentialsfilename = sys.argv[2]
    catalog = sys.argv[3]
    exit(main(servername, credentialsfilename, catalog))

