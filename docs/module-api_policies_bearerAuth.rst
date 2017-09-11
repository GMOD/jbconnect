===================================
Module: ``api/policies/bearerAuth``
===================================


.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========

bearerAuth Policy

Policy for authorizing API requests. The request is authenticated if the 
it contains the accessToken in header, body or as a query param.
Unlike other strategies bearer doesn't require a session.
Add this policy (in config/policies.js) to controller actions which are not
accessed through a session. For example: API request from another client



.. _module-api_policies_bearerAuth.session:

Member: ``session``: 




