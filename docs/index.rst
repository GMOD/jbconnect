********
JBServer
********

**JBServer - an optional analysis server framework for JBrowse**

JBServer does not contain JBrowse.
JBServer is a 
`sails.js <http://sailsjs.com/>`_ application and provides a job execution engine 
(`kue <https://www.npmjs.com/package/kue>`_).  
It can be extended with special 
`installable hooks <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
modules (jbh-*) that can extend both the server end and inject client plugins to 
JBrowse in a single package.  

**JBServer provides the following features:**

+-----------------------------------------------------------------------------------+
| Job queue execution engine (kue)                                                  |
+-----------------------------------------------------------------------------------+
| Tight Integration with JBrowse client                                             |
+-----------------------------------------------------------------------------------+
| RESTful APIs (**Blueprints**)                                                     |
+-----------------------------------------------------------------------------------+
| Database ORM, Any Database, MySql, PostgreSQL Mongo, Redis, local (**Waterline**) |
+-----------------------------------------------------------------------------------+
| Express-based Compatible routes & Middleware                                      |
+-----------------------------------------------------------------------------------+
| Socket.io - sub/pub, WebSockets, Auto Integrate Models                            |
+-----------------------------------------------------------------------------------+
| Passport.js - role-based security, access control, OAuth                          |
+-----------------------------------------------------------------------------------+
| Extensible plugin framework based on Sails.js Installable Hooks                   |
+-----------------------------------------------------------------------------------+
| **Grunt** Customizable asset workflow, LESS, SASS, Stylus                         |
+-----------------------------------------------------------------------------------+

See: features_

goto: 'Ringo'_

goto: jabba_

Contents
========

.. toctree::
   :maxdepth: 2

   quick_start
   features
   advanced_setup
   hooks
   api


Ringo
=====

.. _jabba:

This is a test