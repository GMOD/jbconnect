**************
Advanced Setup
**************

JBrowse Install In Separate Directory 
=====================================

If JBrowse is already installed in another directory, use this command to specify
the JBrowse directory.

``todo: ./jbutil ...``

Manual Configuration
====================

Modify the configuration file as necessary.

To view aggregate configuration: ``./jbutil --config``

The aggregate config file is the merged config of JBServer and it's install jbh- (hook)
modules.

Edit config file: ``nano config/globals.js``

:: 

    jbrowse: {
        jbrowseRest: "http://localhost:1337",       // path accessible by web browser
        jbrowsePath: jbPath,                        // or point to jbrowse directory (ie. "/var/www/jbrowse/") 
        routePrefix: "jbrowse",                     // jbrowse is accessed with http://<addr>/jbrowse
        dataSet: [
            {
                dataPath: "sample_data/json/volvox" // registered datasets.  
            }
        ]
    }




Install Optional JBServer Hooks
===============================

``npm install jbh-<hook name>`` (i.e. jbh-jblast)




