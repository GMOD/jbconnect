***********
Quick Start
***********
 
Pre-Install
===========

JBServer requires `redis <https://redis.io/>`_, which is used by the queue framework 
(`kue <https://www.npmjs.com/package/kue>`_).

Install and run *redis*

:: 

    yum install redis
    redis-server

Install
=======

Install the JBServer application.

::

    git clone http://github.com/gmod/jbserver
    cd jbserver
    npm install
    npm install jbrowse
    npm install jbrowse or npm install gmod/jbrowse
    ./jb_setup.js

Run
===


``sails lift``

From a web browser, access the application

``http://localhost:1337/jbrowse``




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




