********
Features
********

.. _jbs-features:

JBConnect is a Sails.js application
***********************************

JBConnect utilizes Sails.js, provideing the following features:


+-------------------------------------------------------------------------------+
| **Javascript** (NODE-based)                                                   |
+-------------------------------------------------------------------------------+
| **Blueprints** Auto-generate  CRUD APIs, ESTful APIs, Socket.io (events)      |
+-------------------------------------------------------------------------------+
| **Waterline** ORM, Any Database, MySql, PostgreSQL Mongo, Redis, local        |
+-------------------------------------------------------------------------------+
| **Express-based** Compatible routes & Middleware                              |
+-------------------------------------------------------------------------------+
| **Socket.io** sub/pub, WebSockets, Auto Integrate Models                      |
+-------------------------------------------------------------------------------+
| **Passport.js** role-based security, access control, OAuth                    |
+-------------------------------------------------------------------------------+
| **Installable** Hooks (jbh-*), Extensible plugin framework                    |
+-------------------------------------------------------------------------------+
| **Grunt** Customizable asset workflow, LESS, SASS, Stylus                     |
+-------------------------------------------------------------------------------+
| **Front-End Agnostic** Angular, backbone, bootstrap, ember, ...               |
+-------------------------------------------------------------------------------+

Directory Layout
================

::

    JBConnect project
    ├── api                             Standard sails API layout
    ├── assets                          contains client accessible assets
    ├── bin                             Utilities
    ├── config                          Configuration files.
    │   ├── globals.js                  Config file for module
    │   └── libroutes.js                Library Routes
    ├── data                            Contains the local database file
    │   └── localDiskDb.db              Local database file
    ├── docs                            Documentation
    │   └── genapi-rst                  jsdoc generated rst files
    ├── plugins                         Client-side Plugins
    │   └── JBClient                    Client plugin             
    ├── test                            Test
    ├── views                           View pages
    ├── Gruntfile.js                    Grunt config
    ├── jbutil                          JBServer Utility
    └── package.json



jbutil Command
==============

``jbutil`` is a setup/configuration utility for JBConnect.  jbh-hook can extend
``jbutil`` command options. (see: :ref:`jbs-hooks-extend`)

This example shows that ``jbh-jblast`` adds a number of commands to ``jbutil``

::

    $ ./jbutil --help
    Usage: jbutil [OPTION]
          --config            display merged config
          --blastdbpath=PATH  (jblast) existing database path
          --setupworkflows    (jblast) [install|<path>] "install" project wf, or specify .ga file 
          --setuptools        (jblast) setup jblast tools for galaxy
          --setupdata         (jblast) setup data and samples
          --setupindex        (jblast) setup index.html in the jbrowse directory
          --setuphistory      setup history
      -h, --help              display this help

See: jbs-jbutilextending_

.. _jbs-queue-framework:

Queue Framework
===============

JBConnect uses `Kue <https://automattic.github.io/kue/>`_ as the basis for the queue framework.
However, Kue is encapsulated in the Job model/controller.  
Since Kue requires `redis <https://redis.io/>`_ database, 
redis server must be running.  An integrated job panel is available when
the JBClient plugin is active. (see: :ref:`jbs-jbclient`)

For diagnostic purposes, a Kue utility can be used to view/manage the Kue database
content: ``http://localhost:1337/kue``

This route can be disabled with in config/http.js.



.. _jbs-globals-config:

Configuration
=============

JBrowse configurations are in ``config/globals.js``

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


Client-Side Plugins
===================

Client-side plugins are defined in the `plugins` directory.  Plugins will automatically
be accessible by the client side.  However, they need to be configured in the `plugins:`
section of the particular dataset in JBrowse `trackList.json`.

Plugin routes are virtual routes
With respect to the client side, they appear in the client-side's plugin directory
only when the server is lifted.



Library Routes
==============

libroutes maps dependancy routes for client-side access.
These provide access to modules that are required for use by the client-side 
plugins or other client-side code.
The framework looks for libroutes.js in jbh- (hook modules), in their respective config directories

For example: for the module jquery,
The module is installed with 'npm install jquery'
The mapping the mapping 'jquery': '/jblib/jquery'
makes the jquery directory accessible as /jblib/jquery from the client side.

Library Routes are virtual routes, in that they only exist when the server is lifted.
They are virtually mapped to their respective locations in the node_modules directory.


``config/libroutes.js``:

::

    module.exports = {
        lib: {
                'jquery.mb.extruder':       '/jblib/mb.extruder',
                'jQuery-ui-Slider-Pips':    '/jblib/slider-pips',
                'jquery-ui-dist':           '/jblib/jquery-ui'
        }
    };



Standalone Register / Login / Logout Routes
===========================================

Stand-alone routes allow for basic register/login/logout functionality free
from the JBrowse interface.  

Stand-alone interfaces use `bootstrap <http://getbootstrap.com/>`_

Register: ``http://<address>:1337/register``

.. image:: img/register.jpg

Login: ``http://<address>:1337/login``

.. image:: img/login.jpg

Logout: ``http://<address>:1337/logout``

Get Login State: ``http://<address>:1337/loginstate``

The routes are defined in `config/routes.js`.

 

Login/Logout Panel
------------------

Login Panel

.. image:: img/login-integrated.jpg

Loguot Panel

.. image:: img/logout-integrated.jpg



Job Queue Panel
---------------

JBConnect uses *Kue* as the queue framework.  Since Kue requires *redis* database, 
redis server must be running.  An integrated job panel is available when
the JBClient plugin is active. (see: :ref:`jbs-jbclient`)

Integrated Job Panel:

.. image:: img/job-panel.jpg


Jservice Framework
==================

todo

Test Framework
==============

Test framework uses

* Mocha for unit test
* Nightwatch for end-to-end, supporting phantomjs, selenium and online service such as browserstack.
* Istanbul for coverage

To execute

``npm test``

by default nightwatch is setup for phantomjs.
Selenium requires running an additional selenium server

``package.json``:

::

  "scripts": {
    "test": "nyc node ./node_modules/mocha/bin/mocha test/bootstrap.test.js test/integration/**/*.test.js test/e2e/**/*.test.js --nightwatch-test phantomjs",
  },


The option ``--nightwatch-test`` can be:

* ``phantomjs`` - runs client tests with phantomjs
* ``selenium`` - runs client tests with selenium
* ``browserstack`` - runs client test with selenium through remote browserstack account.


Documentation Framework
=======================

For integrated documentation, `JSdoc3 <http://usejsdoc.org/>`_ is used 
to generate API docs from code with jsdoc-sphinx, a jsdoc template that generates 
RestructuredText (RST) and Sphinx.  This enables support for 
`readthedocs <https://readthedocs.org/>`_.

See: `RST/Sphinx Cheatsheet <http://openalea.gforge.inria.fr/doc/openalea/doc/_build/html/source/sphinx/rest_syntax.html>`_  


``npm run gendocs``
