/* 
 * a test service that can be executed.  when invoked, it will execute, perform some nothingness, and create a track. 
 */
var fs = require("fs-extra");
var approot = require("app-root-path");

module.exports = {

    fmap: {
        crazy_test:     'get'
    },
    init: function(params,cb) {
        return cb();
    },
    /**
     * Job service validation
     * 
     * @param {type} params - parameters
     * @returns {Number} - 0 if successful
     * 
     */
    validateParams: function(params) {
        return 0;   // success
    },
    /**
     * returns job service name
     * 
     * @param {type} params - parameters
     * @returns {string} -  
     */
    generateName(params) {
        return "A big nothing burger";
    },
    /**
     * Job service job start.
     * 
     * called when an appropriate jobs is found and exeuted by service.
     * 
     * @param {object} kJob
     */
    beginProcessing(kJob) {
        //let g = sails.config.globals.jbrowse;
        let thisb = this;
        let nothingName = "Nothing burger ";
        
        sails.log.info("nothingBurgerService beginProcessing"+kJob.id);

        kJob.data.count = 2;
       
        // delay 5 seconds for nothing, really (just so it sits in the queue for longer)
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
    _postProcess: function(kJob) {
        
        // insert track into trackList.json
        this.postDoNothing(kJob,function(newTrackJson) {
            //console.log("newTrack",newTrackJson)
            postAction.addToTrackList(kJob,newTrackJson);
        });
    },
    /**
     * this generates the track definition from the track template
     * 
     * @param {object} kWorkflowJob - kue job reference
     * @param {object} cb - callback function
     * 
     */
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
        
        //if it's a single definition, coerce to an array
        if (Object.prototype.toString.call(newTrackJson) !== '[object Array]') {
            newTrackJson = [ newTrackJson ];
        }

        let trackLabel = kJob.id+' nothing burger results';
        
        newTrackJson[0].label = "NOTHING_"+kJob.id+Math.random(); 
        newTrackJson[0].key = trackLabel;     
        
        // validate the new track JSON structures
        newTrackJson.forEach (function (track) {
            if (!track.label) {
                let msg = "Invalid track JSON: missing a label element";
                sails.log.error(msg);
                kWorkflowJob.kDoneFn(new Error(msg));
                return;
            }
        });
        
        
        newTrackJson[0].metadata = {
                description: 'Search result job: '+kJob.id
        };

        kJob.data.track = newTrackJson[0];
        kJob.update(function() {});

        cb(newTrackJson);
    },
    crazy_test(req,res) {
        let data = {
            hi: "there",
            by: "gone"
        }        
        return res.ok(data);
    }
    
};



