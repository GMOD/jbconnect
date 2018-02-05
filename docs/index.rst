********
JBServer
********

**JBConnect - a tightly integrated analysis framework for JBrowse**

JBrowse does not require JBConnect to operate.

JBConnect is a 
`sails.js <http://sailsjs.com/>`_ application and provides a job execution engine 
(`kue <https://www.npmjs.com/package/kue>`_).
  
JBConnect can be extended with  
*jbh-hook* modules that extend both server and client-ends in a single package.
(see: :ref:`jbs-hook-install` and :ref:`jbs-hooks`)  

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



Contents
========

.. toctree::
   :maxdepth: 2

   quick_start
   features
   setup
   hooks
   api


