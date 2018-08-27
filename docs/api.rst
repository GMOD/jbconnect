***
API
***


.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Namespace: ``AuthController``
*****************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Authentication Controller.

See also Passport model.


.. _AuthController.login:


Function: ``login``
===================

Render the login page

The login form itself is just a simple HTML form:
::
  <form role="form" action="/auth/local" method="post">
    <input type="text" name="identifier" placeholder="Username or Email">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Sign in</button>
  </form>

You could optionally add CSRF-protection as outlined in the documentation:
http://sailsjs.org/#!documentation/config.csrf

A simple example of automatically listing all available providers in a
Handlebars template would look like this:
::
  {{#each providers}}
    <a href="/auth/{{slug}}" role="button">{{name}}</a>
  {{/each}}

The ``next`` parameter can specify the target URL upon successful login.

Example: ``GET http://localhost:1337/login?next=http://localhost:1337/jbrowse?data=sample_data/json/volvox``

.. js:function:: login(req, res)

    
    :param Object req: request
    :param Object res: response
    
.. _AuthController.login:


Function: ``login``
===================



.. js:function:: login()

    
    
.. _AuthController.logout:


Function: ``logout``
====================

Log out a user and return them to the homepage

Passport exposes a logout() function on req (also aliased as logOut()) that
can be called from any route handler which needs to terminate a login
session. Invoking logout() will remove the req.user property and clear the
login session (if any).

For more information on logging out users in Passport.js, check out:
http://passportjs.org/guide/logout/

Example: ``GET http://localhost:1337/logout``

.. js:function:: logout(req, res)

    
    :param Object req: request
    :param Object res: response
    
.. _AuthController.register:


Function: ``register``
======================

Render the registration page

Just like the login form, the registration form is just simple HTML:
::
  <form role="form" action="/auth/local/register" method="post">
    <input type="text" name="username" placeholder="Username">
    <input type="text" name="email" placeholder="Email">
    <input type="password" name="password" placeholder="Password">
    <button type="submit">Sign up</button>
  </form>

``GET /register``

.. js:function:: register(req, res)

    
    :param Object req: request
    :param Object res: response
    
.. _AuthController.loginstate:


Function: ``loginstate``
========================

get login state

``GET http://localhost:1337/loginstate``

Example Result:
::
   {
       "loginstate": true,
       "user": {
           "username": "juser",
           "email": "juser@jbrowse.org"
       }
   }

.. js:function:: loginstate(req, res)

    
    :param object req: request
    :param object res: response
    
.. _AuthController.provider:


Function: ``provider``
======================

Create a third-party authentication endpoint

.. js:function:: provider(req, res)

    
    :param Object req: request
    :param Object res: response
    
.. _AuthController.callback:


Function: ``callback``
======================

Create a authentication callback endpoint

This endpoint handles everything related to creating and verifying Pass-
ports and users, both locally and from third-aprty providers.

Passport exposes a login() function on req (also aliased as logIn()) that
can be used to establish a login session. When the login operation
completes, user will be assigned to req.user.

For more information on logging in users in Passport.js, check out:
http://passportjs.org/guide/login/

.. js:function:: callback(req, res)

    
    :param Object req: request
    :param Object res: response
    
.. _AuthController.disconnect:


Function: ``disconnect``
========================

Disconnect a passport from a user

``GET /logout``

.. js:function:: disconnect(req, res)

    
    :param Object req: request
    :param Object res: response
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``controllers/DatasetController``
*****************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

REST Interfaces for Dataset model

Datasets are configure in ``config/globals.js`` file.

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

``GET /dataset/get``

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

``GET /jobactive/get``

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
        "path": "/var/www/html/jbconnect/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
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

REST interfaces for Service model.

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

REST interfaces for TrackController

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
``GET /track/get``

Get filtered tracks by dataset:

``GET /track/get?id=1`` where id is the dataset id

``GET /track/get?pat=sample_data/json/volvox`` where path is the dataset path

.. js:function:: get(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.add:


Function: ``add``
=================

add a new track

``POST /track/add``

Calling example:
::
  let newTrack = {
      "autocomplete": "all",
      "track": "EST",
      "style": {
          "className": "est"
      },
      "key": "HTMLFeatures - ESTs",
      "feature": [
          "EST_match:est"
      ],
      "storeClass": "JBrowse/Store/SeqFeature/NCList",
      "urlTemplate": "tracks/EST/{refseq}/trackData.json",
      "compress": 0,
      "label": "EST",
      "type": "FeatureTrack",
      "category": "Miscellaneous"
  };
  $.post( "/track/add", newTrack, function( data ) {
    console.log( "result", data );
  }, "json");

.. js:function:: add(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.modify:


Function: ``modify``
====================

modify an existing track

POST ``/track/modify``

Calling example:
::
  let modifyTrack = {
      "autocomplete": "all",
      "track": "EST",
      "style": {
          "className": "est"
      },
      "key": "HTMLFeatures - ESTs",
      "feature": [
          "EST_match:est"
      ],
      "storeClass": "JBrowse/Store/SeqFeature/NCList",
      "urlTemplate": "tracks/EST/{refseq}/trackData.json",
      "compress": 0,
      "label": "EST",
      "type": "FeatureTrack",
      "category": "Miscellaneous"
  };
  $.post( "/track/modify", modifyTrack, function( data ) {
    console.log( "result", data );
  }, "json");

.. js:function:: modify(req, res)

    
    :param object req: request
    :param object res: response
    
.. _module-controllers_TrackController.remove:


Function: ``remove``
====================

remove an existing track

``POST /track/remove``

Calling example:
::
  $.post( "/track/remove", { trackId: 23 }, function( data ) {
    console.log( "result", data );
  }, "json");

.. js:function:: remove(req, res)

    
    :param object req: request
    :param object res: response
    






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

Datasets known to JBConnect are defined in config/globals.js
(see: :ref:`jbs-globals-config`)

Dataset object:
::
  {
    "name": "Volvox",
    "path": "sample_data/json/volvox",
    "createdAt": "2018-02-01T05:38:26.320Z",
    "updatedAt": "2018-02-01T05:38:26.320Z",
    "id": 1
  }
     
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

    
    :param object params: search critera (i.e. ``{id: 1,user:'jimmy'}`` )
    :param function cb: callback ``function(err,array)``
    
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
      * **Example Job object:**
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
        "path": "/var/www/html/jbconnect/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
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
      
**Event Mappings:**
+----------------------------+----------------+
| Kue Events                 | Job Events     |
+============================+================+
| * queue-enqueue            | create         |
+----------------------------+----------------+
| * queue-start              | update         |
+----------------------------+----------------+
| * queue-failed             | update         |
+----------------------------+----------------+
| * queue-failed-attempt     | update         |
+----------------------------+----------------+
| * queue-progress           | update         |
+----------------------------+----------------+
| * queue-complete           | update         |
+----------------------------+----------------+
| * queue-remove             | remove         |
+----------------------------+----------------+
| * queue-promotion          | unused         |               
+----------------------------+----------------+

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

    
    :param object params: search critera (i.e. ``{id: 1,user:'jimmy'}`` )
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

JobActive object example:
::
  {
    "active": 0,
    "createdAt": "2017-11-23T00:53:41.864Z",
    "updatedAt": "2018-02-07T07:59:32.471Z",
    "id": 1
  }


.. _module-models_JobActive.Init:


Function: ``Init``
==================

initialize starts the job active monitor

.. js:function:: Init(params, cb)

    
    :param object params: value is ignored
    :param type cb: callback ``function cb(err)``
    
.. _module-models_JobActive.Get:


Function: ``Get``
=================

Get list of tracks based on critera in params

.. js:function:: Get(params, cb)

    
    :param object params: search critera (i.e. ``{id: 1,user:'jimmy'}`` )
    :param function cb: callback ``function(err,array)``
    
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

    
    :param Object password: password
    :param function next: next policy
    






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

Example job service object:
::
  {
    "name": "serverSearchService",
    "type": "service",
    "module": "search",
    "createdAt": "2018-02-01T05:38:26.289Z",
    "updatedAt": "2018-02-07T07:59:31.430Z",
    "id": 1
  }








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

Track object example:
::
  {
    "dataset": 1,
    "path": "sample_data/json/volvox",
    "lkey": "DNA",
    "trackData": {
      "seqType": "dna",
      "key": "Reference sequence",
      "storeClass": "JBrowse/Store/Sequence/StaticChunked",
      "chunkSize": 20000,
      "urlTemplate": "seq/{refseq_dirpath}/{refseq}-",
      "label": "DNA",
      "type": "SequenceTrack",
      "category": "Reference sequence"
    },
    "createdAt": "2018-02-01T05:38:26.339Z",
    "updatedAt": "2018-02-01T05:38:26.339Z",
    "id": 1
  }


.. _module-models_Track.Init:


Function: ``Init``
==================



.. js:function:: Init(params, cb)

    
    :param type params: parameters
    :param type cb: callback function
    
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

    
    :param object params: search critera
    :param function cb: callback ``function(err,array)``
    
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

Example User object:
::
    {
      "username": "juser",
      "email": "juser@jbrowse.org",
      "admin": true,
      "createdAt": "2017-11-29T21:00:56.726Z",
      "updatedAt": "2017-11-29T21:00:56.726Z",
      "id": 2
    }








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

Traverse ``jbutils-ext.js`` of submodules (*-jbconnect-hook)

.. js:function:: doExtScripts(cb)

    
    :param function cb: callback
    
.. _module-services_jbutillib.getMergedConfig:


Function: ``getMergedConfig``
=============================

Returned merged jbrowse config.  
Merged from ``*-jbconnect-hook`` ``config/globals.js``, local ``config/globals.js``

.. js:function:: getMergedConfig()

    
    
.. _module-services_jbutillib.getClientDependencies:


Function: ``getClientDependencies``
===================================



.. js:function:: getClientDependencies(filter)

    
    :param string filter: (ie. ".css" or ".js")
    :return Array: the aggregated client dependencies from webIncludes.
    
.. _module-services_jbutillib.injectIncludesIntoHtml:


Function: ``injectIncludesIntoHtml``
====================================

Inject css/js into JBrowse index.html

.. js:function:: injectIncludesIntoHtml()

    
    
.. _module-services_jbutillib.setupPlugins:


Function: ``setupPlugins``
==========================

add plugins to ``trackList.json``.

.. js:function:: setupPlugins()

    
    
.. _module-services_jbutillib.removeIncludesFromHtml:


Function: ``removeIncludesFromHtml``
====================================

remove css/js from JBrowse index.html

.. js:function:: removeIncludesFromHtml()

    
    
.. _module-services_jbutillib.unsetupPlugins:


Function: ``unsetupPlugins``
============================

remove plugins from ``trackList.json``.

.. js:function:: unsetupPlugins()

    
    
.. _module-services_jbutillib.safeCopy:


Function: ``safeCopy``
======================

copy src to targ, but if targ exists, it will backup the target by appending a number

.. js:function:: safeCopy(src, origTarg)

    
    :param string src: source
    :param string origTarg: target
    :return string: final target filename
    
.. _module-services_jbutillib.safeWriteFile:


Function: ``safeWriteFile``
===========================

if content is the same as target, do nothing.
if content is different than  target, write new content to target file.

.. js:function:: safeWriteFile(content, origTarg)

    
    :param type content: content to write
    :param type origTarg: target file
    :return string: backuped up filename
    
.. _module-services_jbutillib.install_database:


Function: ``install_database``
==============================

Install the sails database from ``./bin``.

.. js:function:: install_database(overwrite)

    
    :param int overwrite: 0, do not overwrite db.  1, overwrite db.
    
.. _module-services_jbutillib.zapRedis:


Function: ``zapRedis``
======================

cleanout redis database

.. js:function:: zapRedis()

    
    
.. _module-services_jbutillib.injectPlugins:


Function: ``injectPlugins``
===========================

Inject client-side plugins into the JBrowse plugins dir

Note: as of JBrowse 1.13.0, you must run `npm run build` after this function, webpack build.

.. js:function:: injectPlugins()

    
    :return injectPlugins(): (int) count - count of plugins injected.
    
.. _module-services_jbutillib.removePlugins:


Function: ``removePlugins``
===========================

remove client side plugins from JBrowse index.html

.. js:function:: removePlugins()

    
    
.. _module-services_jbutillib.getPlugins:


Function: ``getPlugins``
========================

get the list of plugins.  This includes JBConnect plugins as well as plugins of JBConnect hook modules that are loaded.

.. js:function:: getPlugins()

    
    :return object: array of plugin objects
    
.. _module-services_jbutillib.addRoute:


Function: ``addRoute``
======================

Add a route

.. js:function:: addRoute(params, module, route, target)

    
    :param object params: eg. ``{app: <app-object>,express: <express-object>}``
    :param string module: the module name (ie. ``"jquery"``)
    :param string route: the route (ie. ``"/jblib/jquery"``)
    :param string target: the target (ie ``"/var/www/html/jbconnect/node_modules/jquery"``)
    
.. _module-services_jbutillib.addPluginRoute:


Function: ``addPluginRoute``
============================

Add a plugin route

.. js:function:: addPluginRoute(params, module, route, target)

    
    :param object params: eg. ``{app: <app-object>,express: <express-object>}``
    :param string module: the module name (ie. ``"jblast"``)
    :param string route: the route (ie. ``"/jbrowse/plugins/JBlast"``)
    :param string target: the target (ie ``"/var/www/html/jbconnect/node_modules/jblast-jbconnect-hook/plugins/JBlast"``)
    


.. _module-services_jbutillib.fs:

Constant: ``fs``: 

.. _module-services_jbutillib.path:

Constant: ``path``: 

.. _module-services_jbutillib.approot:

Constant: ``approot``: 

.. _module-services_jbutillib.glob:

Constant: ``glob``: 

.. _module-services_jbutillib.sh:

Constant: ``sh``: 

.. _module-services_jbutillib.merge:

Constant: ``merge``: 

.. _module-services_jbutillib.config:

Constant: ``config``: 

.. _module-services_jbutillib.util:

Constant: ``util``: 

.. _module-services_jbutillib.html2json:

Constant: ``html2json``: 

.. _module-services_jbutillib.json2html:

Constant: ``json2html``: 

.. _module-services_jbutillib._:

Constant: ``_``: 





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

Module: ``services/postAction``
*******************************


.. contents:: Local Navigation
   :local:

   
Description
===========

Used by hooks to add a track and announce to subscribers.


.. _module-services_postAction.addToTrackList:


Function: ``addToTrackList``
============================

Add track to track list and notify.

.. js:function:: addToTrackList(kJob, newTrackJson)

    
    :param object kJob: kue job reference
    :param JSON newTrackJson: new track JSON
    






.. raw:: html

   <hr style="border-color: black; border-width: 2px;">

Module: ``services/serverSearchService``
****************************************


.. contents:: Local Navigation
   :local:

   
Description
===========

.. _jbs-job-search-service:

Job service implementing the server-side regex search service.

``plugins/ServerSearch`` is the client counterpart to to this job service.

Setting up a job:
::
       var searchParams = { 
           expr: 'GATGAT',
           regex: 'false',
           caseIgnore: 'true',
           translate: 'false',
           fwdStrand: 'true',
           revStrand: 'true',
           maxLen: '100' 
       }        
       var postData = {
           service: "serverSearchService",
           dataset: "sample_data/json/volvox",
           searchParams: searchParams
       };
       url = "/job/submit";
       $.post(url, postData, function(data) {
           console.log("result",data);
       },'json')
       .fail(function(err) {
           console.log("error",err);
       });

Note: the search parameters are the same as that of 

Configuration (config/globals.js):
::
  jbrowse: {
      serverSearch: {
          resultPath: "ServerSearch",
          resultCategory: "Search Results",
          trackTemplate: "ServerSearchTrackTemplate.json",
          workflowScript: "ServerSearch.workflow.js",
          processScript:   'ServerSearchProcess.html'
      },
      services: {
          'serverSearchService': {name: 'serverSearchService',  type: 'service'}
      }
  }

Job queue entry:
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
          "expr": "atagt",
          "regex": "false",
          "caseIgnore": "true",
          "translate": "false",
          "fwdStrand": "true",
          "revStrand": "true",
          "maxLen": "100"
        },
        "name": "atagt search",
        "asset": "113_search_1513478281528",
        "path": "/var/www/html/jbconnect/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
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
          "key": "113 atagt results",
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


.. _module-services_serverSearchService.init:


Function: ``init``
==================



.. js:function:: init()

    
    
.. _module-services_serverSearchService.validateParams:


Function: ``validateParams``
============================

Job service validation

.. js:function:: validateParams(params)

    
    :param type params: parameters
    :return Number: - 0 if successful
    
.. _module-services_serverSearchService.generateName:


Function: ``generateName``
==========================

returns job service name

.. js:function:: generateName(params)

    
    :param type params: parameters
    :return string: -
    
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

    
    :param object kWorkflowJob: kue job reference
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

initialize the job service framework

.. js:function:: init(params, cb2)

    
    :param type params: parameters
    :param type cb2: callback
    
.. _module-services_serviceProc.addService:


Function: ``addService``
========================

add a service

.. js:function:: addService(service, cb)

    
    :param object service: service
    :param function cb: callback
    
.. _module-services_serviceProc.execute:


Function: ``execute``
=====================



.. js:function:: execute()

    
    





