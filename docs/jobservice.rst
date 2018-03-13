***********
Job Service
***********

.. _jbs-jobservice:

A job service (jservice) is a special service that can react to the job queue
framework asking it to execute something.  It can also service specialized routes
(eg. ``/service/exec/<function>/...``).

It is generally named something

A job service code reside in the ``api/services`` directory. 


JBConnect has a pre-packaged job service: jbs-job-search-service_


Function Map Section
********************

Job services must contain a ``fmap`` section which defines the routes that the
job service exposes.  And there should be corresponding route functions defined
in the module.

The framework will process the request as the specified 

::
    module.exports = {
        fmap: {
            set_filter:         'post',
            get_blastdata:      'get',
            get_trackdata:      'get'
        },
        set_filter(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },
        get_blastdata(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },
        get_trackdata: function(req, res) {
            var requestData = req.allParams();
            ...
            return res.send(ret);
        },

For request parameters, see:
`Sails req <https://sailsjs.com/documentation/reference/request-req>`_

For response options, see:
`Sails res <https://sailsjs.com/documentation/reference/response-res>`_


Calling the functions
---------------------

``fmap`` functions are addressed with either GET or POST using the URL route
(eg. ``"/service/exec/set_filter"``).  Parameters can be passed as data payload
or as URL parameters.  

Our handling functions generally use ``var requestData = req.allParams()``,
making the handlers rather indiscriminate to how the parameters are passed.

An example of a POST request.
::
    var postData = {
          filterParams: filter,
          asset: "152_search_1517988101045", // usually the track.label name
          dataset: "sample_data/json/volvox"
    }
    $.post( "/service/exec/set_filter", postData , function(data) {
        console.log( data );
    }, "json");

An example of a GET request as configured in trackList.json.
::
    "baseUrl": "/",
    "urlTemplate": "/service/exec/get_trackdata/?asset=151_1517462263883&dataset=sample_data%2Fjson%2Fvolvox",


Function Name Overlap
---------------------

If two job services have the same function name, the first the first job service
registered will take precedent.  

For example:  Say serviceA and serviceB both have a fmap function called my_function,
and serviceA is defined before serviceB, then calling ``/service/exec/my_function`` will 
execute serviceA.my_function.

However, serviceB.my_function can still be addressed with the service-specific calling format,
``/service/exec/serviceB:my_function``.


Obligatory Functions for Job Runners
************************************

Job services that are job runners, that react to job execution must implement the following functions:

::
    // job service parameter validation
    // jservice calls this to determine if the parameters are sufficient to execute the job.
    validateParams: function(params) {
        if (typeof params.searchParams === 'undefined') return "searchParams not defined";
        if (typeof params.searchParams.expr === 'undefined') return "search string undefined";
        return 0;   // success
    },
    // job name generator
    // jservice framework calls this to determine the jobs user-readable name.
    generateName(params) {
        return params.searchParams.expr+' search';
    },
    // jservice calls this to execute the job.  ``kJob`` is the kue object.
    beginProcessing(kJob) {
        if (successful) kJob.kDoneFn();
        if (failed) kJob.kDoneFn(Error("this job failed because..."));   
    }


Configuration
*************

Job services are defined in config/globals under the jbrowse/services section.

::
    jbrowse: {
        // list of services that will get registered.
        services: {
            // service                  display name                    type                alias
            'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
            'filterService':            {name: 'filterService',         type: 'service'},
            'entrezService':            {name: 'entrezService',         type: 'service'}
        },

where 
- *service* refers to the job service module name
- *display name* is the human readable name of the service
- *type* - ``workflow`` means it's a job runner and ``service`` means it on hosts route functions.


Submitting a Job
****************

This is an example of job submission.  The content of the POST data will depend
of the type of job that is being submitted.  However, ``service:`` must be
included and reference an existing job service.

::
    var postData = {
          service: "jblast",
          dataset: "sample_data/json/volvox",
          region: ">ctgA ctgA:44705..47713 (- strand) class=remark length=3009\nacatccaatggcgaacataa...gcgagttt",
          workflow: "NCBI.blast.workflow.js"
      };
    $.post( "/job/submit", postData , function( result ) {
        console.log( result );
    }, "json");




``service`` can either be the service module name (ie. "basicWorkflowService")
or an the alias, if an alias if defined, given the configuration example below.

::
    services: {
        // service                  display name                    type                alias
        'basicWorkflowService':     {name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},

