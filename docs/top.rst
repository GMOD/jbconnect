********
JBServer 
********

JBServer is an optional analysis server framework for JBrowse (it does not contain JBrowse).
JBServer is a sails.js application and provides a job execution engine (kue).  
It can be extended with special installable hooks modules (jbh-*) that can extend both
the server end and inject client plugins to JBrowse in a single package.  

ref: hooks
ref: sails.js
ref: kue
 

Install
=======


``
git clone http://github.com/gmod/jbserver
npm install
``

Install JBrowse (Optional)
--------------------------

``npm install jbrowse`` or ``npm install gmod/jbrowse``

Install optional jbh- hooks
---------------------------

``npm install jbh-<hook name>`` (i.e. jbh-jblast)

Setup
=====

Config File
-----------

Modify the configuration file as necessary.

To view aggregate configuration: ``./jbutil --config``

The aggregate config file is the merged config of JBServer and it's install jbh- (hook)
modules.

Edit config file: ``nano config/globals.js``


Run
===

``sails lift``


Production Deployment
==========

todo: production deployment


Test
====

``npm test``


Document Generation
===================

``npm run gendocs``



