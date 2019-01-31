*********
Tutorials
*********

Creating a Stand-Alone Job Service for local workflow processing
================================================================

This tutorial demonstrates how to create a job service that can be executed by the JBlast Plugin


Job Runner functions
--------------------

::

    module.exports = {

        //  in the function map (fmap), get_workflow function is minimally require from the Process BLAST dialog.
        //  get_hit_details is not required since we don't actaully do a blast operation in the example.
        fmap: {
            get_workflows:      'get'
        },

        //  (required by Job Service)
        //  perform any initialization on the module
        init: function(params,cb) {
            return cb();
        },

        //  (required by Job Runner Service)
        //  provides mechanism to validate parameters of the job service
        validateParams: function(params) {
            return 0;   // success
        },

        //  (required by Job Runner Service)
        //  job service generate readable name for the job that will appear in the job queue
        generateName(params) {
            return "sample job";
        },

        //  (required by Job Runner Service)
        //  Return a list of available workflow scripts.  This is used to populate the Plugin's workflow.
        //  This should minimally return at least one item.
        //  Here, we are just passing a dummy list.
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

        // (required by Job Runner Service)
        // this is called by the job execution engine to begin processing
        beginProcessing(kJob) {
            //let g = sails.config.globals.jbrowse;
            let thisb = this;
            let nothingName = "sample nothing ";
            
            sails.log.info("sampleJobService beginProcessing"+kJob.id);

            kJob.data.count = 10;   // 10 seconds of nothing
        
            let f1 = setInterval(function() {
                if (kJob.data.count===0) {
                    clearInterval(f1);
                    thisb._postProcess(kJob);
                }
                kJob.data.name = nothingName+kJob.data.count--;
                kJob.update(function() {});
                sails.log.info(kJob.data.name);
            },1000);
        },

        //  (not required)
        //  After the job completes, we do some processing in postDoNothing() and then call 
        //  addToTrackList to insert a new track into JBrowse
        _postProcess: function(kJob) {
            
            // insert track into trackList.json
            this.postDoNothing(kJob,function(newTrackJson) {
                //console.log("newTrack",newTrackJson)
                postAction.addToTrackList(kJob,newTrackJson);
            });
        },

        //  (not required)
        //  here, we do some arbitrary post prosessing.
        //  in this example, we are setting a dummy jbrowse track data.    
        postDoNothing:function(kJob,cb) {

            var g = sails.config.globals.jbrowse;
            var templateFile = approot+'/bin/nothingTrackTemplate.json';
            var newTrackJson = {};
            
            var error = false;
            try {
                var newTrackData = fs.readFileSync(templateFile);
                newTrackJson = JSON.parse(newTrackData);
            }
            catch(err) {
                var msg = "failed to read template file: "+templateFile+' '+err;
                sails.log.error(msg);
                error = err;
            }
            if (error) return cb(error);
            
                newTrackJson = [ newTrackJson ];

            let trackLabel = kJob.id+' sample job results';
            
            newTrackJson[0].label = "SAMPLEJOB_"+kJob.id+Math.random(); 
            newTrackJson[0].key = trackLabel;     
            
            kJob.data.track = newTrackJson[0];
            kJob.update(function() {});

            cb(newTrackJson);
        }



Job Queue Updates
-----------------

    kJob.data.name = nothingName+kJob.data.count--;
    kJob.update(function() {});



Monitoring processing
---------------------

todo


Completion processing
---------------------

    kJob.kDoneFn();
    kJob.kDoneFn(new Error("failed to add track"));
    postAction.addToTrackList(kJob,newTrackJson);
