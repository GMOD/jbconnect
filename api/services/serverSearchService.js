/*
 * seqSearchService
 * service to handle  
 */

var fs = require("fs-extra");
var approot = require("app-root-path");

var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;

module.exports = {

    fmap: {
//        submit_search:          'post',
        send_search_result:     'post'
    },
    init: function(params,cb) {
        return cb();
    },
    /**
     * 
     * @param {object} req
     *      searchParams - search parameters
     *           expr": "tgac"          - search sequence or regex string
     *           "regex": false/true    - 
     *           "caseIgnore": false/true
     *           "translate": false/true,
     *           "fwdStrand": false/true,
     *           "revStrand": false/true,
     *           "maxLen": 100,     
     *      dataset - the dataset path i.e. "sample_data/json/volvox" 
     * @param {object} res
     */
    submit_search: function(req, res) {
        var params = req.allParams();
        this._searchSubmit(params,function(result) {
            res.ok(result);
        });
    },
    /**
     * This is used to receive result data from the phantomjs component (not currently used)
     * @param {object} req
     *      jobid           job that is managing this session
     *      end             true if this is the end of the series
     *      ...             other fields
     *      data            data returned.
     * @param {object} res
     */
    send_search_result: function(req, res) {
        
        // (not functional yet.)
        
        var params = req.allParams();
        
        // lookup job kJob = ...
        
        // setup kJob.kDonefn
        
        this._postProcess(kJob);
        
    },
    validateParams: function(params) {
        if (typeof params.searchParams === 'undefined') return "searchParams not defined";
        if (typeof params.searchParams.expr === 'undefined') return "search string undefined";
        return 0;   // success
    },
    generateName(params) {
        return params.searchParams.expr+' search';
    },
    /*
     * submit workflow. (obsolete)
     * 
     * @param {object} params
     *      searchParams - search parameters
     *      dataset - the dataset path i.e. "sample_data/json/volvox" 
     * @param {function} cb
     */
    _searchSubmit: function(params,cb) {
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        var gg = sails.config.globals;
        
        var searchParams = params.searchParams;
        var dataset = params.dataset;
        var workflow = params.workflow;

        searchParams = this._fixParams(searchParams);  // necessary?
        //console.log("searchParams fixed:",searchParams);

        // create the kue job entry
        var jobdata = {
            service: "serverSearchService",
            workflow: workflow,
            name: searchParams.expr+' search',
            searchParams: searchParams, 
            dataset: {
                path: dataset
            }
        };
        var kJob = gg.kue_queue.create('workflow', jobdata);
        
        kJob.save(function(err){
            if (err) {
                return cb(null,{status:'error',msg: "error create kue workflow",err:err});
            }
            cb({status:'success',jobId: kJob.id,asset:kJob.data.asset},null);
        });
    },
    beginProcessing(kJob) {
        var g = sails.config.globals.jbrowse;
        var thisb = this;
        
        sails.log.info("seqSearchService beginProcessing"+kJob.id);

        kJob.data.asset = kJob.id+"_search_"+ new Date().getTime();
        searchParamFile = kJob.data.asset+".json";
        kJob.data.path = g.jbrowsePath + kJob.data.dataset +'/'+ g.serverSearch.resultPath;
        kJob.data.outfile = kJob.data.asset+".gff";

        kJob.update(function() {});

        // make sure result path directory exists
        var error = false;
        try {
            fs.ensureDirSync(kJob.data.path);
        }
        catch (e) {
            var msg = 'failed to create dir: '+kJob.data.path+' '+e;
            sails.log.error(msg);
            kJob.kDoneFn(new Error(msg));
            error = true;
        }
        if (error) return;
        
        // copy the process script to the jbrowse directory
        var error = false;
        var src     = approot + "/bin/" + g.serverSearch.processScript;
        var dest    = g.jbrowsePath + g.serverSearch.processScript;
        try {
            sails.log('copy',src,dest);
            fs.copySync(src,dest);
        }
        catch (e) {
            var msg = 'failed to copy file to jbrowse path: '+src+' to '+dest+' '+e;
            sails.log.error(msg);
            kJob.kDoneFn(new Error(msg));
            error = true;
        }
        if (error) return;
            
        thisb._createSearchParamFile(kJob);

        // delay 5 seconds for nothing, really (just so it sits in the queue for longer)
        setTimeout(function() {
            thisb._runWorkflow(kJob);
        },5000);
    },
    _fixParams(s) {
        var _s={};
        _s.expr          = s.expr;
        _s.regex         = eval(s.regex);
        _s.caseIgnore     = eval(s.caseIgnore);
        _s.translate     = eval(s.translate);
        _s.fwdStrand     = eval(s.fwdStrand);
        _s.revStrand     = eval(s.revStrand);
        _s.maxLen        = eval(s.maxLen);
        _s.test = false;
        return _s;
    },
    _createSearchParamFile: function(job) {
        // if direcgtory doesn't exist, create it
        var filePath = job.data.path+'/'+job.data.searchParamFile;
        
        if (!fs.existsSync(job.data.path)){
            fs.mkdirSync(job.data.path);
        }  
        var error = false;
        try {
            ws = fs.createWriteStream(filePath);
            ws.write(JSON.stringify(job.data.searchParams,null,4));
            ws.end();
        }
        catch (e) {
            sails.log.error(e,filePath);
            job.kDoneFn(new Error('failed to create search param file'));
            error = true;
        }
    },
    _runWorkflow: function(kWorkflowJob) {

        var thisb = this;
        var g = sails.config.globals.jbrowse;
        
        var workflowFile = g.serverSearch.workflowScript;              //"ServerSearch.workflow.js";
        if (typeof kWorkflowJob.data.workflow !== 'undefined')
            workflowFile = kWorkflowJob.data.workflow;
        
        var wf = process.cwd()+'/workflows/'+workflowFile;
        var outPath = g.jbrowsePath + kWorkflowJob.data.dataset + '/' + g.serverSearch.resultPath;

        sails.log('>>> Executing workflow',wf);
        
        //todo: verify existance of processScript in the jbrowse 
        
        var processScript = g.jbrowseRest+'/'+g.routePrefix+'/'+g.serverSearch.processScript;
        
        // pass to workflow script
        var program = phantomjs.exec(wf,
            g.routePrefix,                                                      // prefix
            processScript,                                          // 'http://localhost:1337/jbrowse/SearchProcess.html',
            kWorkflowJob.data.path+'/'+kWorkflowJob.data.outfile,               // output file (full path)
            JSON.stringify(kWorkflowJob.data.searchParams),                     // search parameters
            kWorkflowJob.id                                                     // job id
        );
            
        program.stdout.pipe(process.stdout);
        program.stderr.pipe(process.stderr);
        program.on('exit', function(code) {
          // do something on end
          sails.log(">>> workflow completed",code);
          
          if (code !== 0) {
              kWorkflowJob.kDoneFn(new Error('Workflow script completion error: '+code));
              return;
          }
          thisb._postProcess(kWorkflowJob);
          
        });        
    },
    _postProcess: function(kWorkflowJob) {
        //var postAction = require("./postAction");
        
        // insert track into trackList.json
        this.postMoveResultFiles(kWorkflowJob,function(newTrackJson) {
            //console.log("newTrack",newTrackJson)
            postAction.addToTrackList(kWorkflowJob,newTrackJson);
        });
    },
    /**
     * this generates track template
     * 
     * @param {type} kWorkflowJob
     * @param {type} cb
     */
    postMoveResultFiles:function(kWorkflowJob,cb) {

        var g = sails.config.globals.jbrowse;
        var templateFile = approot+'/bin/'+g.serverSearch.trackTemplate;
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

        // validate the new track JSON structures
        newTrackJson.forEach (function (track) {
            if (!track.label) {
                var msg = "Invalid track JSON: missing a label element";
                sails.error(msg);
                kWorkflowJob.kDoneFn(new Error(msg));
                return;
            }
        });
        
        var trackLabel = kWorkflowJob.id+' '+kWorkflowJob.data.searchParams.expr+' results';
        
        // remove baseUrl
        if (typeof newTrackJson[0].baseUrl !== 'undefined') delete newTrackJson[0].baseUrl;
        
        //newTrackJson[0].baseUrl = g.jbrowseRest+'/'+g.routePrefix+'/'+kWorkflowJob.data.dataset+'/';
        
        newTrackJson[0].urlTemplate = g.serverSearch.resultPath+"/"+kWorkflowJob.data.outfile;  // gff, TODO (should not be blast result path)

        newTrackJson[0].label = kWorkflowJob.data.asset; 
        newTrackJson[0].key = trackLabel;     
        
        newTrackJson[0].metadata = {
                description: 'Search result job: '+kWorkflowJob.id
            }
        newTrackJson[0].category = "Search Results";
        //newTrackJson[0].storeCache = false;

        newTrackJson[0].sequenceSearch = true;     
        kWorkflowJob.data.track = newTrackJson[0];
        kWorkflowJob.update(function() {});

        cb(newTrackJson);
        
        // some utility functions
        function escapeRegExp(str) {
            return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }
        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }
    }
    
};

