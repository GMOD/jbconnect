========================================
Module: ``api/services/protocols/local``
========================================


.. contents:: Local Navigation
   :local:

Children
========

.. toctree::
   :maxdepth: 1
   
   
Description
===========

Local Authentication Protocol

The most widely used way for websites to authenticate users is via a username
and/or email as well as a password. This module provides functions both for
registering entirely new users, assigning passwords to already registered
users and validating login requesting.

For more information on local authentication in Passport.js, check out:
http://passportjs.org/guide/username-password/


.. _module-api_services_protocols_local.register:


Function: ``register``
======================

Register a new user

This method creates a new user from a specified email, username and password
and assign the newly created user a local Passport.

.. js:function:: register(req, res, next)

    
    :param Object req: Register a new user
    
    This method creates a new user from a specified email, username and password
    and assign the newly created user a local Passport.
    :param Object res: Register a new user
    
    This method creates a new user from a specified email, username and password
    and assign the newly created user a local Passport.
    :param function next: Register a new user
    
    This method creates a new user from a specified email, username and password
    and assign the newly created user a local Passport.
    
.. _module-api_services_protocols_local.connect:


Function: ``connect``
=====================

Assign local Passport to user

This function can be used to assign a local Passport to a user who doens't
have one already. This would be the case if the user registered using a
third-party service and therefore never set a password.

.. js:function:: connect(req, res, next)

    
    :param Object req: Assign local Passport to user
    
    This function can be used to assign a local Passport to a user who doens't
    have one already. This would be the case if the user registered using a
    third-party service and therefore never set a password.
    :param Object res: Assign local Passport to user
    
    This function can be used to assign a local Passport to a user who doens't
    have one already. This would be the case if the user registered using a
    third-party service and therefore never set a password.
    :param function next: Assign local Passport to user
    
    This function can be used to assign a local Passport to a user who doens't
    have one already. This would be the case if the user registered using a
    third-party service and therefore never set a password.
    
.. _module-api_services_protocols_local.login:


Function: ``login``
===================

Validate a login request

Looks up a user using the supplied identifier (email or username) and then
attempts to find a local Passport associated with the user. If a Passport is
found, its password is checked against the password supplied in the form.

.. js:function:: login(req, identifier, password, next)

    
    :param Object req: Validate a login request
    
    Looks up a user using the supplied identifier (email or username) and then
    attempts to find a local Passport associated with the user. If a Passport is
    found, its password is checked against the password supplied in the form.
    :param string identifier: Validate a login request
    
    Looks up a user using the supplied identifier (email or username) and then
    attempts to find a local Passport associated with the user. If a Passport is
    found, its password is checked against the password supplied in the form.
    :param string password: Validate a login request
    
    Looks up a user using the supplied identifier (email or username) and then
    attempts to find a local Passport associated with the user. If a Passport is
    found, its password is checked against the password supplied in the form.
    :param function next: Validate a login request
    
    Looks up a user using the supplied identifier (email or username) and then
    attempts to find a local Passport associated with the user. If a Passport is
    found, its password is checked against the password supplied in the form.
    

.. _module-api_services_protocols_local.username:

Member: ``username``: 

.. _module-api_services_protocols_local.email:

Member: ``email``: 

.. _module-api_services_protocols_local.protocol:

Member: ``protocol``: 

.. _module-api_services_protocols_local.password:

Member: ``password``: 

.. _module-api_services_protocols_local.user:

Member: ``user``: 

.. _module-api_services_protocols_local.accessToken:

Member: ``accessToken``: 

.. _module-api_services_protocols_local.protocol:

Member: ``protocol``: 

.. _module-api_services_protocols_local.user:

Member: ``user``: 

.. _module-api_services_protocols_local.protocol:

Member: ``protocol``: 

.. _module-api_services_protocols_local.password:

Member: ``password``: 

.. _module-api_services_protocols_local.user:

Member: ``user``: 

.. _module-api_services_protocols_local.protocol:

Member: ``protocol``: 

.. _module-api_services_protocols_local.user:

Member: ``user``: 




