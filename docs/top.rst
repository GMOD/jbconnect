********************
JBServer Quick Start
********************

JBServer is an optional analysis server framework for JBrowse (it does not contain JBrowse).
JBServer is a 
`sails.js <http://sailsjs.com/>`_ application and provides a job execution engine 
(`kue <https://www.npmjs.com/package/kue>`_).  
It can be extended with special 
`installable hooks <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
modules (jbh-*) that can extend both the server end and inject client plugins to 
JBrowse in a single package.  
 
Pre-Install
===========

Install `redis` database, which is used by the queue framework.
(`kue <https://www.npmjs.com/package/kue>`_)

``yum install redis``

Starting redis

``redis-server``


Install
=======

Install the JBServer application.

::

    git clone http://github.com/gmod/jbserver
    cd jbserver
    npm install


Install JBrowse (Optional)
--------------------------

If JBrowse is already installed in another directory, use this command to specify
the JBrowse directory.

``todo: ./jbutil ...``

JBrowse can also be installed as a module:

``npm install jbrowse`` or ``npm install gmod/jbrowse``

By default, JBrowse is not installed with the demo app.  To install the demo app,
run this from either the JBServer directory or the JBrowse installation directory.

``./jb_setup.js``


Install optional jbh- hooks
---------------------------

``npm install jbh-<hook name>`` (i.e. jbh-jblast)

Setup
=====

Modify the configuration file as necessary.

To view aggregate configuration: ``./jbutil --config``

The aggregate config file is the merged config of JBServer and it's install jbh- (hook)
modules.

Edit config file: ``nano config/globals.js``


Run
===

``sails lift``

From a web browser, access the application

``http://localhost:1337/jbrowse``

Production Deployment
=====================

.. todo:: 

production deployment


Test
====

``npm test``


Document Generation
===================

``npm run gendocs``



