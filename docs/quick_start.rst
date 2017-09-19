***********
Quick Start
***********
 
Pre-Install
===========

JBServer requires `redis <https://redis.io/>`_, which is used by the queue framework 
(`kue <https://www.npmjs.com/package/kue>`_).

Install and run *redis*

:: 

    yum install redis
    redis-server

Install
=======

Install the JBServer application.

::

    git clone http://github.com/gmod/jbserver
    cd jbserver
    npm install
    npm install jbrowse
    npm install jbrowse or npm install gmod/jbrowse
    ./jb_setup.js

Run
===


``sails lift``

From a web browser, access the application

``http://localhost:1337/jbrowse``


