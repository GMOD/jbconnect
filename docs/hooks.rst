*****************
Installable Hooks
*****************


Directory Layout
----------------

This is the standard directory layout of a jbh- module
::

    jbh- project
    ├── api                     Standard Sails API layout
    │   ├── controllers
    │   ├── hooks
    │   │    └── Myhook
    │   │         ├── index.js
    │   │         └── mapRoutes.js
    │   ├── models
    │   ├── policies
    │   └── services
    ├── bin
    │   └── jbutil-ext.js       jbutil extension module
    ├── config
    │   ├── globals.js          Config file for module
    │   └── libroutes.js        Library Routes
    ├── plugins                  Client-side Plugins
    │   ├── PluginA             
    ├── Gruntfile.js          
    └── package.json

package.json
~~~~~~~~~~~~

Standard sails hooks should contain the following section in the package.json

:: 

    "sails": {
      "isHook": true,
      "hookName": "jblast"
    }

globals.js
~~~~~~~~~~

This file contains config options that are specific to the hook module.
These config options are merged with other jbh- hooks and the JBServer globals.js.

From JBServer, use ``./jbutil --config`` to see the aggregated config. 


Library Routes (libroutes)
~~~~~~~~~~~~~~~~~~~~~~~~~~

libroutes maps dependancy routes for client-side access.
The framework also looks for libroutes.js in jbh- (hook modules), in their respective config directories

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
client side in the JBrowse plugin directories.


Directory
---------

Plugin Routes
-------------

Library Routes
--------------

Extending jbutil
----------------


