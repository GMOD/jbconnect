.. _jbs-hooks:

***************
JBConnect Hooks
***************
JBconnect-Hook leverages the `Sails Installable Hook <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
framework and adds facilities to extend it for JBConnect:
* Job Service integration - provides a runnable job that is launched by the job queue.  This may also include an adapter for local or 3rd party server API access such as Galaxy.  
It may also implement REST APIs specific to the service.  The actual adapter portion is optional.  
* The Job Queue relies on the adapter to provide translated job state information and execution pre and post processing of the analysis operations.  
* The REST API service of the Job Service is a different interface than the standard sails controller interfaces.
* JBrowse plugin / injection (plugins that are tightly integrated with the server-side hooks) along with client-side module dependencies, used by the JBrowse plugins.  
The injection occurs upon sails lift and copies the necessary plugins into the JBrowse server plugins directory.
* Model/controllers/services as provided by Sails Blueprints.  These services are merged with native server models/controllers/services into globally accessible objects.
* Commands via (jbutil) - command options and implementation are merged with the function of jbutil, providing extended command capabilities specific to the JBConnect hook.
* Configurations are aggregated with the JBConnect server configurations.


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
    │   └── globals.js                  Config file for module
    ├── plugins                         Client-side Plugins
    │   └── PluginA                      
    └── package.json


package.json
============

JBConnect hooks extend sails hooks and are required to contain the following section in the package.json

:: 

    "sails": {
      "isHook": true,
      "hookName": "jblast-jbconnect-hook",
      "isJBConnectHook": true
    }


Note the naming convention *-jbconnect-hook is required.


Configurations (globals.js)
===========================

This file contains the default config options that are specific to the hook module.
These config options are merged with other JBConnect hooks and the JBConnect globals.js.

From JBConnect, use ``./jbutil --config`` to see the aggregated config. 


Client-Side JBrowse Plugins
===========================

JBrowse plugin associated with the JBConnect hook can be deployed with the JBConnect hook.  The framework provides for injecting JBrowse plugins into the working JBrowse directory
along with any client-side dependency modules used by the plugin.

The following illustrates how to create a client-side plugin under the framework, with its various configation options.


Developing JBrowse Plugins Under the Framework
----------------------------------------------

Refer to 'Writing JBrowse Plugins (https://jbrowse.org/docs/plugins.html)'_ for more information.

Client-side plugins in plugins directory are copied to the target JBrowse plugins
directories upon ``sails lift``.

A plugin can be disabled if it has an entry in the ``excludePlugins:`` section 
of config/globals.js file or jbconnect.config.js.

::

    jbrowse: {
        ...
        excludePlugins: {
            "ServerSearch": true    // doesn't work with JBrowse 1.13.0+
        },
        ...
    }


Web Include (client dependencies)
---------------------------------

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


.. _jbs-hooks-extend


Extending Commands
==================

jbutil is a general command of JBConnect that are used for various operations.
jbutil-ext.js can be used by the hook to extend options of jbutil. 

* it can extend new command line options
* it can extend the help (i.e. ``./jbutil --help``)

This is a simplified example of jbutil-ext.js.
:

module.exports = {

    // defining the options
    getOptions: function() {
        return [
            ['f' , 'fox'   , 'make a fox sound'],
            ['d' , 'dog'   , 'take out the dog'],
        ];        
    },

    // this is displayed when the user uses the --help or -h option
    getHelpText: function() {
        return  "What does the fox say\n"+
                "./jbutil -fox\n"+
                'Take out the dog\n"+
                "./jbutil -dog\n";
        
    },

    // processing the options
    process: function(opt,path,config) {
        if (opt.options['cat']) {
            ....
        }
        if (opt.options['dog']) {
            ....
        }
        
    },

    // do some pre initialization
    init: function(opt,path,config) {
        return 1; // successful init, or 0 if failed.
    }
    
};


More info about the command options processor can be found in 'node-getopt (https://www.npmjs.com/package/node-getopt)_ .


Additional non-jbutil commands
------------------------------

The hook can also deploy any additional commands in the JBConnect's utils directory.  



Sails Module Layout
===================

This is the standard sails directory layout for models, controllers, policies, and services of a sails hook.
The framework uses marlinspike to integrate controllers, models, policies,
and services into JBConnect.

ref: marlinspike

::

    hook project root
    ├── api                             Standard Sails modules layout
        ├── controllers
        ├── hooks
        ├── models
        ├── policies
        └── services


api/hooks/<hook name>/index.js can be basically be copied from 'here (https://github.com/GMOD/jblast-jbconnect-hook/blob/master/api/hooks/jblast/index.js)'_ . 

This core fragment starts the initialization of the hook.


Config Directory
================

The config file for the hook in the hook project is config/globals.js.  This directory can contain any other config files for the hook, as well.
If a config file is the same as one in the JBConnect project, it will be merged with the corresponding file in the JBConnect/config directory.
Generally, config/globals.js should contain default configurations for the hook, while the jbconnect.config.js file (in JBConnect root) contains user
defined configurations.


.. _jbs-jobservice:


Job Service
===========

A job service is a special service that can react to the job queue
framework asking it to execute something.  

The job service generally resides in api/services directory of the hook and is named <something>Service.js.



Function Map
------------

Job services must contain a ``fmap`` section which defines the routes that the
job service exposes.  And there should be corresponding route functions defined
in the module.

The framework will process the request as the specified 

::

    module.exports = {
        fmap: {
            set_filter:         'post',
            get_blastdata:      'get',
            get_trackdata:      'get'
        },
        set_filter(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },
        get_blastdata(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },
        get_trackdata: function(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },


For request parameters, see:
`Sails req <https://sailsjs.com/documentation/reference/request-req>`_

For response options, see:
`Sails res <https://sailsjs.com/documentation/reference/response-res>`_


Calling fmap functions
----------------------

``fmap`` functions are called with either GET or POST using the URL route
(eg. ``"/service/exec/set_filter"``).  Parameters can be passed as data payload
or as URL parameters.  

Our handling functions generally use ``var requestData = req.allParams()``,
making the handlers rather indiscriminate to how the parameters are passed.

An example of a POST request.
::

    var postData = {
          filterParams: filter,
          asset: "152_search_1517988101045", // usually the track.label name
          dataset: "sample_data/json/volvox"
    }
    $.post( "/service/exec/set_filter", postData , function(data) {
        console.log( data );
    }, "json");


An example of a GET request as configured in trackList.json.

::

    "baseUrl": "/",
    "urlTemplate": "/service/exec/get_trackdata/?asset=151_1517462263883&dataset=sample_data%2Fjson%2Fvolvox",


*incomplete*

Function Name Overlap
---------------------

If two job services have the same function name, the first the first job service
registered will take precedent.  

For example:  Say serviceA and serviceB both have a fmap function called my_function,
and serviceA is defined before serviceB, then calling ``/service/exec/my_function`` will 
execute serviceA.my_function.

However, serviceB.my_function can still be addressed with the service-specific calling format,
``/service/exec/serviceB:my_function``.


.. _jbs-jobrunner:

Obligatory Functions for Job Runners
------------------------------------

Job services that are job runners that react to job execution, must implement the following functions:

::

    // job service parameter validation
    // jservice calls this to determine if the parameters are sufficient to execute the job.
    validateParams: function(params) {
        if (typeof params.searchParams === 'undefined') return "searchParams not defined";
        if (typeof params.searchParams.expr === 'undefined') return "search string undefined";
        return 0;   // success
    },
    // job name generator
    // jservice framework calls this to determine the jobs user-readable name that appears in the job queue.
    generateName(params) {
        return params.searchParams.expr+' search';
    },
    // jservice calls this to execute the job.  ``kJob`` is the kue object.
    beginProcessing(kJob) {
        if (successful) kJob.kDoneFn();
        if (failed) kJob.kDoneFn(Error("this job failed because..."));   
    }


Job Service Configuration
-------------------------

Job services are defined in config/globals.js or in jbconnect.config.js.

::

    jbrowse: {
        // list of services that will get registered.
        services: {
            // service                  display name                    type                alias
            'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
            'filterService':            {name: 'filterService',         type: 'service'},
            'entrezService':            {name: 'entrezService',         type: 'service'}
        },


where 
- *service* refers to the job service module name
- *display name* is the human readable name of the service
- *type* - ``workflow`` means it's a job runner and ``service`` means it only hosts route functions.


Submitting a Job
----------------

A Job Service must be implemented as a job runner to be a queueable job.   (See jbs-jobrunner_)

This is an example of job submission.  The content of the POST data will depend
of the type of job that is being submitted.  However, ``service:`` must be
included and reference an existing job service.

::

    var postData = {
          service: "jblast",  // this can be the name of the job service or its alias
          dataset: "sample_data/json/volvox",
          // FASTA formated query sequence
          region: ">ctgA ctgA:44705..47713 (- strand) class=remark length=3009\nacatccaatggcgaacataa...gcgagttt",
          workflow: "NCBI.blast.workflow.js"
      };
    $.post( "/job/submit", postData , function( result ) {
        console.log( result );
    }, "json");


``service`` can either be the service module name (ie. "basicWorkflowService")
or an the alias, if an alias if defined, given the configuration example below.

::

    services: {
        // service                  display name                    type                alias
        'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},


