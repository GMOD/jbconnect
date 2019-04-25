*********************
Configuration Options
*********************

.. _jbs-separate-dir:

JBrowse Installed In Separate Directory 
=======================================

The JBrowse directory can also be configured manually. (See :ref:`jbs-globals-js`)



Configuration Files
===================

A number of configuration files are in the ``./config`` directory.  A few of the
more important ones (ones that JBSserver touches) are described mentioned in the table below.  
See `Sails Configuration <http://sailsjs.com/documentation/reference/configuration>`_
for a better description of the configuration framework.

+-------------------------------+----------------------------------------------------------+
| :ref:`jbs-globals-js`         | global configuration file                                |
+-------------------------------+----------------------------------------------------------+
| http.js                       | Custom middleware and /jbrowse route is setup here.      |
+-------------------------------+----------------------------------------------------------+
| passport.js, policies.js      | passport framework and auth policies config              |
+-------------------------------+----------------------------------------------------------+
| routes.js                     | various route configurations                             |
+-------------------------------+----------------------------------------------------------+
| connections.js                | choice of database - local, mongo, mysql, ...            |
|                               | (we use local by default.)  The DB file is in the        |
|                               | ``./data/localDiskDb.db``.                               |
+-------------------------------+----------------------------------------------------------+


.. _jbs-globals-js

globals.js
----------

To view aggregate configuration: ``./jbutil --config``

The aggregate config is the merged globals.js combined with the globals.js of
server hook modules.

The aggregate config file is the merged config of JBConnect and its installed jbh- (hook)
modules.

Edit config file: ``nano config/globals.js``

:: 

    jbrowse: {
        jbrowseRest: "http://localhost:1337",
        jbrowsePath: jbPath,                        // or "/var/www/jbrowse/"
        routePrefix: "jbrowse",                     // jbrowse is accessed with http://<addr>/jbrowse
        
        dataSet: {
             Volvox: {path: "sample_data/json/volvox"}
        },
        
        // search service settings
        serverSearch: {
            resultPath: "ServerSearch",
            resultCategory: "Search Results",
            trackTemplate: "ServerSearchTrackTemplate.json",
            workflowScript: "ServerSearch.workflow.js",
            processScript:   'ServerSearchProcess.html'
        },
        // search job service registration
        services: {
            'serverSearchService': {name: 'serverSearchService',  type: 'service'}
        },
        
        /*
         * Virtual Routes
         * These routes reference node_modules that are used by the client and
         * accessed by virtual route.
         */
        libRoutes: {
            // name         node_modules dir            virtual route
            'jquery':       {module: 'jquery',          vroute:'/jblib/jquery'},
            'bootstrap':    {module: 'bootstrap',       vroute:'/jblib/bootstrap'},
            'jqueryui':     {module: 'jquery-ui-dist',  vroute:'/jblib/jquery-ui'},
            'mbextruder':   {module: 'jquery.mb.extruder', vroute:'/jblib/mb.extruder'}
        },
        /*
         * Web Includes
         * These includes are injected into JBrowse ``index.html`` upon ``sails lift``.
         */
        webIncludes: {
            // key                    virtual route
            "css-bootstrap":         {lib: "/jblib/bootstrap/dist/css/bootstrap.min.css"},
            "css-mbextruder":        {lib: "/jblib/mb.extruder/css/mbExtruder.css"},
            "css-jqueryui":          {lib: "/jblib/jquery-ui/jquery-ui.min.css"},
            "css-jqueryuistructure": {lib: "/jblib/jquery-ui/jquery-ui.structure.min.css"},
            "css-jqueryuitheme":     {lib: "/jblib/jquery-ui/jquery-ui.theme.min.css"},
            "js-sailsio":            {lib: "/js/dependencies/sails.io.js"},
            "js-jquery":             {lib: "/jblib/jquery/dist/jquery.min.js" },
            "js-jqueryui":           {lib: "/jblib/jquery-ui/jquery-ui.min.js" },
            "js-bootstrap":          {lib: "/jblib/bootstrap/dist/js/bootstrap.min.js"},
            "js-mbextruderHover":    {lib: "/jblib/mb.extruder/inc/jquery.hoverIntent.min.js"},
            "js-mbextruderFlip":     {lib: "/jblib/mb.extruder/inc/jquery.mb.flipText.js"},
            "js-mbextruder":         {lib: "/jblib/mb.extruder/inc/mbExtruder.js"}
        }
    }


.. _jbs-hook-install:

Installing JBConnect jbh-hooks
=============================

A 'JBConnect Hook' is basically an *installable sails hook* with specific methods for
extending JBConnect.  JBConnect hooks must have the prefix ``jbh-`` prepended to the name.
For example: jbh-jblast.  When the hook is installed (i.e. ``npm install jbh-jblast``).  JBConnect
will automatically integrate a number of features of the hook directly into JBConnect upon ``sails lift``.

The jbh- hook can extend JBConnect in the following ways:

* Extend models, controllers, policies and services
* Integrated client-side JBrowse plugins injection
* Integrated client-side npm module injection
* Integrated job services (see: jbs-jobservice_)
* Integrated configuration tool (jbutil)
* Aggregated configurations


Installing a hook:

``npm install jbh-<hook name>`` (i.e. jbh-jblast)


For detailed info on jbh-hooks, see: :ref:`jbs-hooks`



.. _jbs-jbclient:

JBClient Plugin
===============

JBrowse GUI intetrated interfaces are available when the ``JBClient`` plugin is 
configured on in the JBrowse client. 

To enable integrated features within the JBrowse app, modify the dataset's 
``trackList.json``, adding ``JBClient`` plugin to the configuration.

*Note: the JBClient plugin is not physically in the JBrowse plugin directory.
It is available as a route.*

::

  "plugins": [
    "JBClient",                    <-----
    "NeatHTMLFeatures",
    "NeatCanvasFeatures",
    "HideTrackLabels"
  ],


Job Service Configuration
=========================

Job services (*jservice*) are a special type of service that are used to extend RESTful API service
and serve processing for job operations.


Configuration is defined in ``config/globals.js`` under the jbrowse section under service.

A definition:    <indexname>: {name: <servicename>, type:<type>, alias:<alias> }

where:
 * indexname - is the reference name service (generally the same as servicename)
 * servicename - is the name of the service reference the service code in api/services.
 * type - is the type of service.  either "workflow" or "service"
 * alias - (optional) if specified, the service can also be referenced by the alias name.

jservice type:
 * workflow - service can serve job execution and RESTful interfaces
 * service - service only serves RESTful interfaces

Job service config in ``config/globals.js``:
::
    // list of services that will get registered.
    services: {
        'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
        'filterService':            {name: 'filterService',         type: 'service'},
        'entrezService':            {name: 'entrezService',         type: 'service'}
    },


.. _jbs-jbutilextending:

Extending jbutil
================

``jbutil`` is a command line utility that is used to configure JBConnect in various
ways. ``jbutil`` can be extended by a installable hook through ``bin/jbutil-ext.js``.

``jbutil-ext.js`` must imeplement these function:
::
    module.exports = {
        // this return the options that the module support.  In this example,
        // we add -t or --test and --thing options to jbutil.

        getOptions: function() {
            return [
                ['t' , 'test=ARG', '(jbh-myhook) this is a test option'],
                ['' , 'thing',   , '(jbh-myhook) this is another test option']
            ];        
        },

        // Extends the help display
        // In this example, we describe how to use --test with a parameter value "abc"

        getHelpText: function() {
            return "\nExample: ./jbutil --test abc\n";
        },
        
        // process options
        // where opt - the option list.
        //       path - path of the module that will process the option (i.e. "./node_modules/jbh-jblast"
        //       config - the aggregate globals.js config.
        
        process: function(opt,path,config) {
            var tool = opt.options['setupindex'];
            if (typeof tool !== 'undefined') {
                jblib.exec_setupindex(this.config);
                jblib.exec_setupPlugins(this.config);
            }

            var tool = opt.options['dbreset'];
            if (typeof tool !== 'undefined') {
        }

See npm module `node-getopt <https://www.npmjs.com/package/node-getopt>`_ for more info. 

