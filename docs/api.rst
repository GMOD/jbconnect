***
API
***


.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/AuthController``
**************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Authentication Controller.

See also Passport model.








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/DatasetController``
*****************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST Interfaces for Dataset model

Datasets are configure in ``config/globals.js`` or ``config.js`` file.

See Dataset Model

**Subscribe to Dataset events:**
::
  io.socket.get('/dataset', function(resData, jwres) {console.log(resData);});
  io.socket.on('dataset', function(event){
     consol.log(event);
  }


.. _module-controllers_DatasetController.get:


Function: ``get``
=================

Enumerate or search datasets

`GET /dataset/get`

.. js:function:: get(req, res)

    
    :param object req: request data
    :param object res: response data
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/JobActiveController``
*******************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST interfaces for JobActive model.

See: JobActive model.

**Subscribe to JobActive events:**
::
  io.socket.get('/jobactive', function(resData, jwres) {console.log(resData);});
  io.socket.on('jobactive', function(event){
     consol.log(event);
  }


.. _module-controllers_JobActiveController.get:


Function: ``get``
=================

Read job active record

`GET /jobactive/get`

.. js:function:: get(req, res)

    
    :param object req: request
    :param object res: response
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/JobController``
*************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST interfaces for Job model

See Job model.

**Subscribe to Job events:**
::
  io.socket.get('/job', function(resData, jwres) {console.log(resData);});
  io.socket.on('job', function(event){
     consol.log(event);
  }


.. _module-controllers_JobController.get:


Function: ``get``
=================

Enumerate or search job list.

``GET /job/get``

Example usage (jQuery): 
:: 
  $.ajax({
      url: "/job/get",
      dataType: "text",
      success: function (data) {
         console.log(data)
      }
  });

The returned ``data`` is a JSON array of *job* objects.

**Example Job object:**
::
  {
      "id": 113,
      "type": "workflow",
      "progress": "100",
      "priority": 0,
      "data": {
        "service": "serverSearchService",
        "dataset": "sample_data/json/volvox",
        "searchParams": {
          "expr": "ttt",
          "regex": "false",
          "caseIgnore": "true",
          "translate": "false",
          "fwdStrand": "true",
          "revStrand": "true",
          "maxLen": "100"
        },
        "name": "ttt search",
        "asset": "113_search_1513478281528",
        "path": "/var/www/html/4jbserver/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
        "outfile": "113_search_1513478281528.gff",
        "track": {
          "maxFeatureScreenDensity": 16,
          "style": {
            "showLabels": false
          },
          "displayMode": "normal",
          "storeClass": "JBrowse/Store/SeqFeature/GFF3",
          "type": "JBrowse/View/Track/HTMLFeatures",
          "metadata": {
            "description": "Search result job: 113"
          },
          "category": "Search Results",
          "key": "113 ttt results",
          "label": "113_search_1513478281528",
          "urlTemplate": "ServerSearch/113_search_1513478281528.gff",
          "sequenceSearch": true
        }
      },
      "state": "complete",
      "promote_at": "1513478280038",
      "created_at": "1513478280038",
      "updated_at": "1513478292634",
      "createdAt": "2018-02-01T05:38:27.371Z",
      "updatedAt": "2018-02-01T05:38:27.371Z"
    }

.. js:function:: get(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_JobController.submit:


Function: ``submit``
====================

Submit a job.

**Example - submit sequence search:**
::
  var postData = {
      service: "serverSearchService",
      dataset: "sample_data/json/volvox,
      searchParams: searchParams
  };
  $.post("/job/submit, postData, function(retdata) {
     console.log(retdata)
  },'json');

Returned data from job submit: ``{ status: "success", jobId: 152 }``, where
``jobId`` is the id of the created job in the job queue.

.. js:function:: submit(req, res)

    
    :param object req: request
    :param object res: response
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/ServiceController``
*****************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST interaces for Service model.

See Service model

**Subscribe to Service events:**
::
  io.socket.get('/service', function(resData, jwres) {console.log(resData);});
  io.socket.on('service', function(event){
     consol.log(event);
  }


.. _module-controllers_ServiceController.get:


Function: ``get``
=================

Enumerate job services (jservices)

``GET /service/get``

.. js:function:: get(req, res)

    
    :param object req: request
    :param object res: response
    

``GET or POST /service/exec/``

This example calls set_filter, a JBlast operation: 
::
  var postData = {
        filterParams: data,
        asset: "jblast_sample",
        dataset: "sample_data/json/volvox"
  }
  $.post( "/service/exec/set_filter", postData , function( data) {
      console.log( data );
  }, "json");

The returned data depends on the service function that is called.






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/TrackController``
***************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST interaces for TrackController

**Subscribe to Track events:**
::
  io.socket.get('/track', function(resData, jwres) {console.log(resData);});
  io.socket.on('track', function(event){
     consol.log(event);
  }


.. _module-controllers_TrackController.get:


Function: ``get``
=================

enumerate tracks or search track list.

Get all tracks
:bash:`GET /track/get`

Get filtered tracks by dataset:

:bash:`GET /track/get?id=1` where id is the dataset id

:bash:`GET /track/get?pat=sample_data/json/volvox` where path is the dataset path

.. js:function:: get(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.add:


Function: ``add``
=================

add a new track

.. js:function:: add(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.modify:


Function: ``modify``
====================

modify an existing track

.. js:function:: modify(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.remove:


Function: ``remove``
====================

remove an existing track

.. js:function:: remove(req, res)

    
    :param object req: request
    :param object res: response
    

.. _module-controllers_TrackController.track:

Member: ``track``: 

.. _module-controllers_TrackController.err:

Member: ``err``: 






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/UserController``
**************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST interfaces for UserController

**Subscribe to User events:**
::
  io.socket.get('/user', function(resData, jwres) {console.log(resData);});
  io.socket.on('user', function(event){
     consol.log(event);
  }


.. _module-controllers_UserController.get:


Function: ``get``
=================

Enumerate or search users

``GET /user/get``

.. js:function:: get(req, res)

    
    :param object req: Enumerate or search users
    
    ``GET /user/get``
    :param object res: Enumerate or search users
    
    ``GET /user/get``
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/Dataset``
**************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Dataset is a model that represents the JBrowse dataset.  Generally, this includes
path to the dataset and some of the data contained in trackList.json.

Datasets known to JBServer are defined in config/globals.js
(see: :ref:`jbs-globals-config`)
     
Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_


.. _module-models_Dataset.Init:


Function: ``Init``
==================

Initializes datasets as defined in config/globals.js.
(see: :ref:`jbs-globals-config`)

.. js:function:: Init(cb)

    
    :param function cb: callback function
    :return undefined: Initializes datasets as defined in config/globals.js.
    (see: :ref:`jbs-globals-config`)
    
.. _module-models_Dataset.Get:


Function: ``Get``
=================

Get list of tracks based on critera in params

.. js:function:: Get(params, cb)

    
    :param object params: search critera (i.e. {id: 1,user:'jimmy'} )
    :param function cb: callback function(err,array)
    
.. _module-models_Dataset.Resolve:


Function: ``Resolve``
=====================

Given either a dataset string (ie. "sample_data/json/volvox" or the database id of a dataset,
it returns a dataset object in the form:

::
    
    {
        path: "sample_data/json/volvox",
        id: 3
    }

Grid table:

+------------+------------+-----------+ 
| Header 1   | Header 2   | Header 3  | 
+============+============+===========+ 
| body row 1 | column 2   | column 3  | 
+------------+------------+-----------+ 
| body row 2 | Cells may span columns.| 
+------------+------------+-----------+

.. js:function:: Resolve(dval)

    
    :param val dval: dataset string (ie. "sample_data/json/volvox") or id (int)
    
         
    Code Example
                   
    ::
        
        {
            path: "sample_data/json/volvox",
            id: 3
        }
    :return object: - dataset object
         dataset (string - i.e. "sample_data/json/volvox" if input was an id
         
    Grid Example:
         
    +------------+------------+-----------+ 
    | Header 1   | Header 2   | Header 3  | 
    +============+============+===========+ 
    | body row 1 | column 2   | column 3  | 
    +------------+------------+-----------+
    
.. _module-models_Dataset.Sync:


Function: ``Sync``
==================

Sync datasets, defined in globals with database.

todo: need to improve, perhaps use async?

.. js:function:: Sync()

    
    :param Sync(): cb - callback function
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/Job``
**********************


.. contents:: Local Navigation
   :local:

   
Description
===========

Job model is an encapsulation of the `Kue <https://automattic.github.io/kue/>`_ job framework.

Kue uses `redis <https://redis.io/>`_ database.  This model synchronizes the Job database with the redis data
through the use of Kue's API.

Kue event messages are stuffed into a FIFO `_eventList` and dequeued with `_processNextEvent` to ensure order.
 
   
Kue Events
+----------------------------+
| * queue-enqueue            |
| * queue-start              |
| * queue-failed             |
| * queue-failed-attempt     |
| * queue-progress           |
| * queue-complete           |
| * queue-remove             |
| * queue-promotion          |
+----------------------------+

Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_


.. _module-models_Job.Init:


Function: ``Init``
==================

start the monitor

.. js:function:: Init()

    
    
.. _module-models_Job.Get:


Function: ``Get``
=================

Get list of tracks based on critera in params

.. js:function:: Get(params, cb)

    
    :param object params: search critera (i.e. {id: 1,user:'jimmy'} )
    :param function cb: callback function(err,array)
    
.. _module-models_Job.Submit:


Function: ``Submit``
====================



.. js:function:: Submit()

    
    
.. _module-models_Job._jobRunner:


Function: ``_jobRunner``
========================



.. js:function:: _jobRunner()

    
    
.. _module-models_Job._kueEventMonitor:


Function: ``_kueEventMonitor``
==============================



.. js:function:: _kueEventMonitor()

    
    
.. _module-models_Job._pushEvent:


Function: ``_pushEvent``
========================



.. js:function:: _pushEvent()

    
    
.. _module-models_Job._processNextEvent:


Function: ``_processNextEvent``
===============================



.. js:function:: _processNextEvent()

    
    
.. _module-models_Job._createJob:


Function: ``_createJob``
========================



.. js:function:: _createJob()

    
    
.. _module-models_Job._updateJob:


Function: ``_updateJob``
========================



.. js:function:: _updateJob()

    
    
.. _module-models_Job.kJob:


Function: ``kJob``
==================



.. js:function:: kJob()

    
    
.. _module-models_Job.sJob:


Function: ``sJob``
==================



.. js:function:: sJob()

    
    
.. _module-models_Job._destroyJob:


Function: ``_destroyJob``
=========================



.. js:function:: _destroyJob()

    
    
.. _module-models_Job._listJobs:


Function: ``_listJobs``
=======================



.. js:function:: _listJobs()

    
    
.. _module-models_Job._syncJobs:


Function: ``_syncJobs``
=======================

Synchronize all kue jobs (kJobs) and sails db jobs (sJobs)
Called upon initialization of the Job model

if the kJob exists but sJob does not, then create the sJob from kJob.
If the sJob exists but not kJob, then delete the sJob

.. js:function:: _syncJobs()

    
    
.. _module-models_Job.kJobs:


Function: ``kJobs``
===================



.. js:function:: kJobs()

    
    
.. _module-models_Job.sJobs:


Function: ``sJobs``
===================



.. js:function:: sJobs()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/JobActive``
****************************


.. contents:: Local Navigation
   :local:

   
Description
===========

JobActive holds a count of the number of active jobs.
It only contains one record that gets updated when the number of active jobs changes.
A timer thread monitors the job queue for active jobs and updates the JobActive record
with any changes to the number of active jobs.
Subscribers to the record (clients) will get notification.
JBClient plugin uses this to determine if a job is active and changes the activity icon
of the job queue panel.


.. _module-models_JobActive.Init:


Function: ``Init``
==================

initialize starts the job active monitor

.. js:function:: Init(params, cb)

    
    :param object params: value is ignored
    :param type cb: callback `function cb(err)`
    
.. _module-models_JobActive.Get:


Function: ``Get``
=================

Get list of tracks based on critera in params

.. js:function:: Get(params, cb)

    
    :param object params: search critera (i.e. {id: 1,user:'jimmy'} )
    :param function cb: callback function(err,array)
    
.. _module-models_JobActive._activeMonitor:


Function: ``_activeMonitor``
============================



.. js:function:: _activeMonitor()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/Passport``
***************************


.. contents:: Local Navigation
   :local:

   
Description
===========

The Passport model handles associating authenticators with users. An authen-
ticator can be either local (password) or third-party (provider). A single
user can have multiple passports, allowing them to connect and use several
third-party strategies in optional conjunction with a password.

Since an application will only need to authenticate a user once per session,
it makes sense to encapsulate the data specific to the authentication process
in a model of its own. This allows us to keep the session itself as light-
weight as possible as the application only needs to serialize and deserialize
the user, but not the authentication data, to and from the session.


.. _module-models_Passport.hashPassword:


Function: ``hashPassword``
==========================

Hash a passport password.

.. js:function:: hashPassword(password, next)

    
    :param Object password: Hash a passport password.
    :param function next: Hash a passport password.
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/Service``
**************************


.. contents:: Local Navigation
   :local:

   
Description
===========

The service module implements the job service frameowrk which are installable 
modules that can host web services and be a job execution processing for a particular
type of job.

Installable services are generally named <servicename>Service.js and reside in the
api/services directory.  For example: a job service built into this project is 
serverSearchService.js

`api/services/serviceProc.js` is the bettr part of the implementation of service

Job services are defined in `config/globals.js` in the jbrowse/services section.








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/Track``
************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Track is a model for a list of tracks that are in the ``trackList.json``'s ``[tracks]`` section.

Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_


.. _module-models_Track.Init:


Function: ``Init``
==================



.. js:function:: Init()

    
    
.. _module-models_Track.StartWatch:


Function: ``StartWatch``
========================



.. js:function:: StartWatch()

    
    
.. _module-models_Track.PauseWatch:


Function: ``PauseWatch``
========================



.. js:function:: PauseWatch()

    
    
.. _module-models_Track.ResumeWatch:


Function: ``ResumeWatch``
=========================



.. js:function:: ResumeWatch()

    
    
.. _module-models_Track.Get:


Function: ``Get``
=================

Get list of tracks based on critera in params

.. js:function:: Get(params, cb)

    
    :param object params: search critera (i.e. {id: 1,user:'jimmy'} )
    :param function cb: callback function(err,array)
    
.. _module-models_Track.Add:


Function: ``Add``
=================



.. js:function:: Add()

    
    
.. _module-models_Track.Modify:


Function: ``Modify``
====================



.. js:function:: Modify()

    
    
.. _module-models_Track.Remove:


Function: ``Remove``
====================



.. js:function:: Remove(dataset, dataset)

    
    :param string dataset: (eg: "sample_data/json/volvlx")
    :param ing dataset: dataset string (i.e. "sample_data/json/volvox"
    :param Remove(dataset, dataset): cb - callback function(err,
    
.. _module-models_Track.Sync:


Function: ``Sync``
==================

Sync tracklist.json tracks with Track model (promises version)

todo: dataSet should accept string or dataSet object id

.. js:function:: Sync(ds,)

    
    :param string ds,: if dataset is not defined, all models are committed.
    
.. _module-models_Track.Save:


Function: ``Save``
==================



.. js:function:: Save()

    
    
.. _module-models_Track._modifyTrack:


Function: ``_modifyTrack``
==========================

Given tracks array, find and update the item with the given updateTrack.
updateTrack must contain label.

.. js:function:: _modifyTrack()

    
    
.. _module-models_Track._removeTrack:


Function: ``_removeTrack``
==========================

Given tracks array, remove the item with the given key (which is track label)

.. js:function:: _removeTrack()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``models/User``
***********************


.. contents:: Local Navigation
   :local:

   
Description
===========

User is the data model for a user.








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``policies/bearerAuth``
*******************************


.. contents:: Local Navigation
   :local:

   
Description
===========

bearerAuth Policy

Policy for authorizing API requests. The request is authenticated if the 
it contains the accessToken in header, body or as a query param.
Unlike other strategies bearer doesn't require a session.
Add this policy (in config/policies.js) to controller actions which are not
accessed through a session. For example: API request from another client








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``policies/isAdmin``
****************************


.. contents:: Local Navigation
   :local:

   
Description
===========

isAdmin policy provides passage if the user contains the property admin: true.

req.session looks something like this:
req.session Session {
     cookie: { path: '/',
         _expires: null,
         originalMaxAge: null,
         httpOnly: true 
     },
     passport: { user: 2 },
     authenticated: true, (true if logged in, 
     user: { username: 'juser', email: 'juser@jbrowse.org' } 
}


.. _module-policies_isAdmin.nonAdminAction:


Function: ``nonAdminAction``
============================



.. js:function:: nonAdminAction()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``policies/passport``
*****************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Passport Middleware

Policy for Sails that initializes Passport.js and as well as its built-in
session support.

In a typical web application, the credentials used to authenticate a user
will only be transmitted during the login request. If authentication
succeeds, a session will be established and maintained via a cookie set in
the user's browser.

Each subsequent request will not contain credentials, but rather the unique
cookie that identifies the session. In order to support login sessions,
Passport will serialize and deserialize user instances to and from the
session.

For more information on the Passport.js middleware, check out:
http://passportjs.org/guide/configure/








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``policies/sessionAuth``
********************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Simple policy to allow any authenticated user.
Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`

Ref: `Sails Policies Concepts <http://sailsjs.org/#!/documentation/concepts/Policies>`_








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/jbRouteUtil``
********************************


.. contents:: Local Navigation
   :local:

   
Description
===========

This module provides functions to inject plugin routes and library routes
that are accessible by the client side.


.. _module-services_jbRouteUtil.addPluginRoutes:


Function: ``addPluginRoutes``
=============================

inject client-side plugins into the clinet plugin directory as routes.
handles submodules plugins too.

.. js:function:: addPluginRoutes()

    
    :param addPluginRoutes(): params
    
.. _module-services_jbRouteUtil.addLibRoutes:


Function: ``addLibRoutes``
==========================

Add library routes

.. js:function:: addLibRoutes()

    
    :param addLibRoutes(): params
    
.. _module-services_jbRouteUtil.addRoute:


Function: ``addRoute``
======================

Add a route

.. js:function:: addRoute(params, module, route, target)

    
    :param object params: Add a route
    :param string module: Add a route
    :param string route: Add a route
    :param string target: Add a route
    
.. _module-services_jbRouteUtil.addPluginRoute:


Function: ``addPluginRoute``
============================



.. js:function:: addPluginRoute()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/jbutillib``
******************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Support library for jbutil command


.. _module-services_jbutillib.doExtScripts:


Function: ``doExtScripts``
==========================

Traverse jbutils-ext.js of submodules (jbh-*)

.. js:function:: doExtScripts(cb)

    
    :param function cb: Traverse jbutils-ext.js of submodules (jbh-*)
    
.. _module-services_jbutillib.getMergedConfig:


Function: ``getMergedConfig``
=============================

Returned merged jbrowse config.  
Merged from jbh-* config/globals.js, local config/globals.js, & config.js

.. js:function:: getMergedConfig()

    
    
.. _module-services_jbutillib.buildHtml:


Function: ``buildHtml``
=======================



.. js:function:: buildHtml()

    
    
.. _module-services_jbutillib.exec_setupindex:


Function: ``exec_setupindex``
=============================



.. js:function:: exec_setupindex(params)

    
    :param type params: 
    :return undefined: 
    
.. _module-services_jbutillib.exec_setupPlugins:


Function: ``exec_setupPlugins``
===============================

setup sample track

.. js:function:: exec_setupPlugins()

    
    
.. _module-services_jbutillib.safeCopy:


Function: ``safeCopy``
======================

copy src to targ, but if targ exists, it will backup the target by appending a number

.. js:function:: safeCopy(src, targ)

    
    :param string src: source
    :param string targ: target
    :return string: final target filename,
    
.. _module-services_jbutillib.safeWriteFile:


Function: ``safeWriteFile``
===========================



.. js:function:: safeWriteFile()

    
    
.. _module-services_jbutillib.install_database:


Function: ``install_database``
==============================



.. js:function:: install_database()

    
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/passport``
*****************************


.. contents:: Local Navigation
   :local:

   
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








.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/serverSearchService``
****************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Job service implementing the server-side regex search service.


.. _module-services_serverSearchService.init:


Function: ``init``
==================



.. js:function:: init()

    
    
.. _module-services_serverSearchService.submit_search:


Function: ``submit_search``
===========================



.. js:function:: submit_search(req, res)

    
    :param object req: ::
    
         searchParams - search parameters
              expr": "tgac"          - search sequence or regex string
              "regex": false/true    - 
              "caseIgnore": false/true
              "translate": false/true,
              "fwdStrand": false/true,
              "revStrand": false/true,
              "maxLen": 100,     
         dataset - the dataset path i.e. "sample_data/json/volvox"
    :param object res: 
    
.. _module-services_serverSearchService.send_search_result:


Function: ``send_search_result``
================================



.. js:function:: send_search_result()

    
    
.. _module-services_serverSearchService.validateParams:


Function: ``validateParams``
============================



.. js:function:: validateParams()

    
    
.. _module-services_serverSearchService.generateName:


Function: ``generateName``
==========================



.. js:function:: generateName()

    
    
.. _module-services_serverSearchService._searchSubmit:


Function: ``_searchSubmit``
===========================



.. js:function:: _searchSubmit()

    
    
.. _module-services_serverSearchService.beginProcessing:


Function: ``beginProcessing``
=============================

Job service job start.
called when an appropriate jobs is found and exeuted by service.

.. js:function:: beginProcessing(kJob)

    
    :param object kJob: Job service job start.
    called when an appropriate jobs is found and exeuted by service.
    
.. _module-services_serverSearchService._fixParams:


Function: ``_fixParams``
========================



.. js:function:: _fixParams()

    
    
.. _module-services_serverSearchService._runWorkflow:


Function: ``_runWorkflow``
==========================



.. js:function:: _runWorkflow()

    
    
.. _module-services_serverSearchService._postProcess:


Function: ``_postProcess``
==========================



.. js:function:: _postProcess()

    
    
.. _module-services_serverSearchService.postMoveResultFiles:


Function: ``postMoveResultFiles``
=================================

this generates the track definition from the track template

.. js:function:: postMoveResultFiles(kWorkflowJob, cb)

    
    :param object kWorkflowJob: this generates the track definition from the track template
    :param object cb: callback function
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/serviceProc``
********************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Support functions for Service model.


.. _module-services_serviceProc.init:


Function: ``init``
==================



.. js:function:: init()

    
    
.. _module-services_serviceProc.addService:


Function: ``addService``
========================



.. js:function:: addService()

    
    
.. _module-services_serviceProc.execute:


Function: ``execute``
=====================



.. js:function:: execute()

    
    





