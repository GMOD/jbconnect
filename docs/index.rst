********
JBServer
********

**an optional server framework for JBrowse**

JBServer is an optional analysis server framework for JBrowse (it does not contain JBrowse).
JBServer is a 
`sails.js <http://sailsjs.com/>`_ application and provides a job execution engine 
(`kue <https://www.npmjs.com/package/kue>`_).  
It can be extended with special 
`installable hooks <http://sailsjs.com/documentation/concepts/extending-sails/hooks/installable-hooks>`_ 
modules (jbh-*) that can extend both the server end and inject client plugins to 
JBrowse in a single package.  


Contents
========

.. toctree::
   :maxdepth: 2

   top
   features
   hooks
   api
