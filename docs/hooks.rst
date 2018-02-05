.. _jbs-hooks:

******************
JBServer jbh-hooks
******************

A 'JBServer jbh-hook' is an 
`installable sails hook <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
with specific methods for
extending JBServer.  jbh-hooks must have the prefix ``jbh-`` prepended to the name.
For example: jbh-jblast.  When the hook is installed (i.e. ``npm install jbh-jblast``).  JBServer
will automatically integrate a number of features of the hook directly into JBServer upon ``sails lift``.

jbh-* Integration
* Models, Controller, Policies, Services (via marlinspikes)
* jbutil command extensions
* client-side plugin exposure, and client module dependencies
* routes via jservice framework or via controllers
* job jservice framework

These features are described below.

Directory Layout
================

This is the standard directory layout of a jbh- module
::

    jbh- hook project
    ├── api                             Standard Sails modules layout
    │   ├── controllers
    │   ├── hooks
    │   │    └── Myhook
    │   │         └── index.js          The main hook
    │   ├── models
    │   ├── policies
    │   └── services
    ├── bin
    │   └── jbutil-ext.js               jbutil extension module
    ├── config
    │   ├── globals.js                  Config file for module
    │   └── libroutes.js                Library Routes
    ├── plugins                         Client-side Plugins
    │   └── PluginA             
    ├── Gruntfile.js          
    └── package.json

package.json
============

Standard sails hooks should contain the following section in the package.json

:: 

    "sails": {
      "isHook": true,
      "hookName": "jblast"
    }

Configurations (globals.js)
===========================

This file contains config options that are specific to the hook module.
These config options are merged with other jbh- hooks and the JBServer globals.js.

From JBServer, use ``./jbutil --config`` to see the aggregated config. 


Configuration (config.js)
=========================

This config file resides in the root of the app and can override config/globals.js
and any config/globals.js from hooks that may be installed.



Library Routes (libroutes)
==========================

libroutes maps dependancy routes for client-side access.
These are routes to modules that are required for use by the client-side 
plugins or other client-side code.
The framework looks for libroutes.js in jbh- (hook modules), in their respective config directories

For example: for the module jquery,
The module is installed with 'npm install jquery'
The mapping the mapping 'jquery': '/jblib/jquery'
makes the jquery directory accessible as /jblib/jquery from the client side.

libroutes.js
::

    module.exports = {
        lib: {
                'jquery.mb.extruder':       '/jblib/mb.extruder',
                'jQuery-ui-Slider-Pips':    '/jblib/slider-pips',
                'jquery-ui-dist':           '/jblib/jquery-ui'
        }
    };



Client-Side Plugins
===================

Client-side plugins in this directory are made available on the JBrowse
client side as routes in the JBrowse plugin directories upon ``sails lift``.



.. _jbs-hooks-extend


Extending jbutil
================

jbutil-ext.js is the file that is read by JBServer and integrates additional command 
options into jbutil (the JBServer utility). 

* it extends new command line options
* it extends the help (i.e. ``./jbutil --help``)


Sails Module Layout
===================

This is the standard sails directory layout for modules of a sails hook.
The framework uses marlinspike to integrate controllers, models, policies,
and services into JBServer.

ref: marlinspike

::

    jbh- project
    ├── api                             Standard Sails modules layout
        ├── controllers
        ├── hooks
        ├── models
        ├── policies
        └── services


The Main Hook
=============

index.js should not be modified.

This core fragment starts the initialization of JBConnect.


config Directory
================

This directory contain config files for the hook.  If the name matches it's counterpart
file in JBServer's config directory, the configurations similar files will be
merged.

JService Framework
==================

todo