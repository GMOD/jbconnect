.. _jbs-hooks:

***************
JBConnect Hooks
***************

A 'JBConnect Hook' is an 
`installable sails hook <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
with specific methods for
extending JBConnect.  Hooks must have the suffix ``-jbconnect-hook`` appended to the name.
For example: jblast-jbconnect-hook.  When the hook is installed (i.e. ``npm install jblast-jbconnect-hook``).  JBConnect
will automatically integrate a number of features of the hook directly into JBConnect upon ``sails lift``.

JBConnect Hook Integration
* Models, Controller, Policies, Services (via marlinspikes)
* jbutil command extensions
* client-side plugin exposure, and client module dependencies
* routes via jservice framework or via controllers
* job jservice framework

These features are described below.

Directory Layout
================

This is the standard directory layout of a JBConnect hook module
::

    *-jbconnect-hook project
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
      "hookName": "jblast",
      "isJBConnectHook": true
    }

Configurations (globals.js)
===========================

This file contains config options that are specific to the hook module.
These config options are merged with other JBConnect hooks and the JBConnect globals.js.

From JBConnect, use ``./jbutil --config`` to see the aggregated config. 


Web Include (client dependencies)
=================================

Web Includes maps dependancies for client-side access.
These are routes to modules that are required for use by the client-side 
plugins or other client-side code.
The framework looks for globals.js in jbh- (hook modules), in their respective config directories

For example: for the dependency module jquery,
Relevant assets are copied into assets/jblib by bin/postinstall.js
The mapping the mapping 'js-jquery': '/jblib/jquery'
makes the jquery directory accessible as /jblib/jquery.min.js from the client side.

globals.js
::

    ...

    jbrowse: {
        /*
         * Web Includes
         * These includes are injected into JBrowse upon sails lift (see tasks/pipeline.js).
         */
        webIncludes: {
            "css-bootstrap":         {lib: "/jblib/bootstrap.min.css"},
            "css-mbextruder":        {lib: "/jblib/mb.extruder/mbExtruder.css"},
            "css-jqueryui":          {lib: "/jblib/jquery-ui.min.css"},
            "css-jqueryuistructure": {lib: "/jblib/jquery-ui.structure.min.css"},
            "css-jqueryuitheme":     {lib: "/jblib/jquery-ui.theme.min.css"},
            "js-sailsio":            {lib: "/js/dependencies/sails.io.js"},
            "js-jquery":             {lib: "/jblib/jquery.min.js" },
            "js-jqueryui":           {lib: "/jblib/jquery-ui.min.js" },
            "js-bootstrap":          {lib: "/jblib/bootstrap.min.js"},
            "js-mbextruderHover":    {lib: "/jblib/mb.extruder/jquery.hoverIntent.min.js"},
            "js-mbextruderFlip":     {lib: "/jblib/mb.extruder/jquery.mb.flipText.js"},
            "js-mbextruder":         {lib: "/jblib/mb.extruder/mbExtruder.js"}
        },
    }
    ...


Client-Side Plugins
===================

Client-side plugins in plugins directory are copied to the target JBrowse plugins
directories upon ``sails lift``.

A plugin can be disabled if it has an entry in the ``excludePlugins:`` section 
of config/globals.js file

::

    jbrowse: {
        ...
        excludePlugins: {
            "ServerSearch": true    // doesn't work with JBrowse 1.13.0+
        },
        ...
    }


.. _jbs-hooks-extend


Extending jbutil
================

jbutil-ext.js is the file that is read by JBConnect and integrates additional command 
options into jbutil (the JBConnect utility). 

* it extends new command line options
* it extends the help (i.e. ``./jbutil --help``)


Sails Module Layout
===================

This is the standard sails directory layout for modules of a sails hook.
The framework uses marlinspike to integrate controllers, models, policies,
and services into JBConnect.

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
file in JBConnect's config directory, the configurations similar files will be
merged.

JService Framework
==================

todo