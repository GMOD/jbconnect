===============================
Module: ``api/models/Passport``
===============================


.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========




.. _module-api_models_Passport.hashPassword:


Function: ``hashPassword``
==========================

Hash a passport password.

.. js:function:: hashPassword(password, next)

    
    :param Object password: Hash a passport password.
    :param function next: Hash a passport password.
    

.. _module-api_models_Passport.bcrypt:

Member: ``bcrypt``: 

.. _module-api_models_Passport.Passport:

Member: ``Passport``: Passport Model

The Passport model handles associating authenticators with users. An authen-
ticator can be either local (password) or third-party (provider). A single
user can have multiple passports, allowing them to connect and use several
third-party strategies in optional conjunction with a password.

Since an application will only need to authenticate a user once per session,
it makes sense to encapsulate the data specific to the authentication process
in a model of its own. This allows us to keep the session itself as light-
weight as possible as the application only needs to serialize and deserialize
the user, but not the authentication data, to and from the session.




