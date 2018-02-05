**************
Setup Options
**************

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
| http.js                       | custom middleware and /jbrowse route is setup here.      |
+-------------------------------+----------------------------------------------------------+
| passport.js, policies.js      | passport framework and auth policies config              |
+-------------------------------+----------------------------------------------------------+
| routes.js                     | various route config                                     |
+-------------------------------+----------------------------------------------------------+
| connections.js                | choice of database - local, mongo, mysql, ...            |
|                               | (we use local by default.)  The DB file is in the        |
|                               | ``./data/localDiskDb.db``.                               |
+-------------------------------+----------------------------------------------------------+


.. _jbs-globals-js

globals.js
----------

Modify the configuration file as necessary.

To view aggregate configuration: ``./jbutil --config``

The aggregate config file is the merged config of JBServer and its installed jbh- (hook)
modules.

Edit config file: ``nano config/globals.js``

:: 

    jbrowse: {
        jbrowseRest: "http://localhost:1337",       // path accessible by web browser
        jbrowsePath: jbPath,                        // or point to jbrowse directory (ie. "/var/www/jbrowse/") 
        routePrefix: "jbrowse",                     // jbrowse is accessed with http://<addr>/jbrowse
        dataSet: [
            {
                dataPath: "sample_data/json/volvox" // datasets.  
            }
        ]
    }



.. _jbs-hook-install:

Installing JBServer jbh-hooks
=============================

A 'JBServer Hook' is basically an *installable sails hook* with specific methods for
extending JBServer.  JBServer hooks must have the prefix ``jbh-`` prepended to the name.
For example: jbh-jblast.  When the hook is installed (i.e. ``npm install jbh-jblast``).  JBServer
will automatically integrate a number of features of the hook directly into JBServer upon ``sails lift``.

The jbh- hook can extend JBServer in the following ways:

* Extend models, controllers, policies and services
* Integrated client-side JBrowse plugins injection
* Integrated client-side npm module injection
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


Jservice Configuration
======================

Jservices are a special type of service that are used to extend RESTful api service
and serve processing for job operations.


Configuration is defined in config/globals under the jbrowse section under service.

A definition:    <indexname>: {name: <servicename>, type:<type>, alias:<alias> }

where:
 * indexname - is the reference name service (generally the same as servicename)
 * servicename - is the name of the service reference the service code in api/services.
 * type - is the type of service.  either "workflow" or "service"
 * alias - (optional) if specified, the service can also be referenced by the alias name.

jservice type:
 * workflow - service can serve job execution
 * service - service only serves RESTful interfaces

::

    // list of services that will get registered.
    services: {
        'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
        'filterService':            {name: 'filterService',         type: 'service'},
        'entrezService':            {name: 'entrezService',         type: 'service'}
    },
