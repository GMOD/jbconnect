*********
Tutorials
*********

Creating a Stand-Alone Job Service for local workflow processing
================================================================

This tutorial demonstrates how to create a job service that can be executed by the JBlast Plugin.

The source code for the tutorial can be found `here <https://github.com/GMOD/jbconnect/blob/master/api/services/sampleJobService.js>`_


Job Runner functions
--------------------

The function map defines the REST APIs that the job service supports.
In the function map (``fmap``), ``get_workflow`` function is minimally require from the Process BLAST dialog.
``get_hit_details`` is not required since we don't actaully do a blast operation in the example.
::

    module.exports = {

        fmap: {
            get_workflows:      'get'
        },


**(required by Job Service)**

Provides opportunity to initialize the Job Service module.
::

        init(params,cb) {
            return cb();
        },


**(required by Job Runner Service)**

Provides mechanism to validate parameters given by the job queuer.
Since our example job is submitted by JBlast, we extect to see a region parameter.
::

        validateParams(params) {
            if (typeof params.region === 'undefined') return "region not undefined";
            return 0;   // success
        },


**(required by Job Runner Service)**

Job service generate readable name for the job that will appear in the job queue
::

        generateName(params) {
            return "sample job";
        },


**(required by JBClient, not required for Job Services in general)**

Return a list of available available options.  This is used to populate the Plugin's Workflow.
This should minimally return at least one item for JBlast client to work properly.
Here, we are just passing a dummy list, which will be ignored by the rest of the example.
::

        get_workflows (req, res) {
            
            wflist = [
                {
                    id: "something",
                    name: "sample do nothing job",
                    script: "something",
                    path: "./"
                }
            ];
            
            res.ok(wflist);
        },


**(required by Job Runner Service)**

``beginProcessing()`` is called by the job execution engine to begin processing.
The kJob parameter is a reference to the `Kue <https://www.npmjs.com/package/kue>`_ job.

::

        beginProcessing(kJob) {
            let thisb = this;
            let nothingName = "sample nothing ";
            
            kJob.data.count = 10;   // 10 seconds of nothing
            let f1 = setInterval(function() {
                if (kJob.data.count===0) {
                    clearInterval(f1);
                    thisb._postProcess(kJob);
                }
                // update the job text
                kJob.data.name = nothingName+kJob.data.count--;
                kJob.update(function() {});
            },1000);
        },

        //  (not required)
        //  After the job completes, we do some processing in postDoNothing() and then call 
        //  addToTrackList to insert a new track into JBrowse
        _postProcess(kJob) {
            
            // insert track into trackList.json
            this.postDoNothing(kJob,function(newTrackJson) {
                postAction.addToTrackList(kJob,newTrackJson);
            });
        },

        //  (not required)
        //  here, we do some arbitrary post prosessing.
        //  in this example, we are setting up a jbrowse track from a canned template.    
        postDoNothing(kJob,cb) {

            let templateFile = approot+'/bin/nothingTrackTemplate.json';
            let newTrackJson = [JSON.parse(fs.readFileSync(templateFile))];
            
            let trackLabel = kJob.id+' sample job results';
            
            newTrackJson[0].label = "SAMPLEJOB_"+kJob.id+Math.random(); 
            newTrackJson[0].key = trackLabel;     
            
            kJob.data.track = newTrackJson[0];
            kJob.update(function() {});

            cb(newTrackJson);
        }


Note that queue data can be changed with the following:
::

    kJob.data.name = nothingName+kJob.data.count--;
    kJob.update(function() {});



Configuration
-------------

To enable: edit jbconnect.config.js add the ``sampleJobService`` line under services and disable the other services.
::

    module.exports  = {
        jbrowse: {
            services: {
                'sampleJobService':         {enable: true,  name: 'sampleJobService    ',  type: 'workflow', alias: "jblast"},
                'basicWorkflowService':     {enable: false, name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
                'galaxyService':            {enable: false, name: 'galaxyService',         type: 'workflow', alias: "jblast"}
            },
        }
    };



Monitoring processing
---------------------

The job runner is responsible for monitoring the state of any potential lengthy analysis opertion.
If the job runner service is intended to perform some lengthy analysis, there would have
to be some mechanism to detect the completion of the operation. 


Completion processing
---------------------

To complete a job, call one of the following. 
::

    **(success)** kJob.kDoneFn();                                 
    **(fail)**    kJob.kDoneFn(new Error("failed to add track"));


This will change the status of the job to either completed or error.

In our example, the helper library postAction handles the completion:     
::

    postAction.addToTrackList(kJob,newTrackJson);


Upon calling ``kJob.kDoneFn()``, the module is required to perform any necessary cleanup.

