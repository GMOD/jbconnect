=================================
Module: ``api/services/passport``
=================================


.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========

Passport Service

A painless Passport.js service for your Sails app that is guaranteed to
Rock Your Socks™. It takes all the hassle out of setting up Passport.js by
encapsulating all the boring stuff in two functions:

  passport.endpoint()
  passport.callback()

The former sets up an endpoint (/auth/:provider) for redirecting a user to a
third-party provider for authentication, while the latter sets up a callback
endpoint (/auth/:provider/callback) for receiving the response from the
third-party provider. All you have to do is define in the configuration which
third-party providers you'd like to support. It's that easy!

Behind the scenes, the service stores all the data it needs within "Pass-
ports". These contain all the information required to associate a local user
with a profile from a third-party provider. This even holds true for the good
ol' password authentication scheme – the Authentication Service takes care of
encrypting passwords and storing them in Passports, allowing you to keep your
User model free of bloat.



.. _module-api_services_passport.provider:

Member: ``provider``: 

.. _module-api_services_passport.provider:

Member: ``provider``: 

.. _module-api_services_passport.identifier:

Member: ``identifier``: 

.. _module-api_services_passport.usernameField:

Member: ``usernameField``: 

.. _module-api_services_passport.Strategy:

Member: ``Strategy``: 

.. _module-api_services_passport.Strategy:

Member: ``Strategy``: 

.. _module-api_services_passport.callback:

Member: ``callback``: 

.. _module-api_services_passport.Strategy:

Member: ``Strategy``: 




