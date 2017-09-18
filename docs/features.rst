********
Features
********

JBServer is a Sails.js application
**********************************

JBServer utilizes Sails.js, provideing the following features

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

    JBServer project
    ├── api                             Standard sails API layout
    ├── assets                          contains client accessible assets
    ├── bin                             Utilities
    ├── config                          Sails configuration files.
    │   ├── globals.js                  Config file for module
    │   └── libroutes.js                Library Routes
    ├── docs                            Documentation
    │   └── genapi-rst                  jsdoc generated rst files
    ├── plugins                         Client-side Plugins
    │   ├── JBClient                    Client plugin             
    ├── test                            Test
    ├── views                           View pages
    ├── Gruntfile.js          
    └── package.json


Queue
=====

JBServer uses *Kue* as the queue framework.  Since Kue requires *redis* database, 
the redis server must be running.

Login / Logout
==============

.. image:: img/login.jpg

.. image:: img/register.jpg

.. image:: img/logout-integrated.jpg

.. image:: img/login-integrated.jpg
