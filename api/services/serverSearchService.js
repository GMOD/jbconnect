/**
 * @module
 * @description 
 * 
 * .. _jbs-job-search-service:
 * 
 * Job service implementing the server-side regex search service.
 * 
 * ``plugins/ServerSearch`` is the client counterpart to to this job service.
 * 
 * Setting up a job:
 * ::
 *        var searchParams = { 
 *            expr: 'GATGAT',
 *            regex: 'false',
 *            caseIgnore: 'true',
 *            translate: 'false',
 *            fwdStrand: 'true',
 *            revStrand: 'true',
 *            maxLen: '100' 
 *        }        
 *        var postData = {
 *            service: "serverSearchService",
 *            dataset: "sample_data/json/volvox",
 *            searchParams: searchParams
 *        };
 *        url = "/job/submit";
 *        $.post(url, postData, function(data) {
 *            console.log("result",data);
 *        },'json')
 *        .fail(function(err) {
 *            console.log("error",err);
 *        });
 * 
 * Note: the search parameters are the same as that of 
 * 
 * Configuration (config/globals.js):
 * ::
 *   jbrowse: {
 *       serverSearch: {
 *           resultPath: "ServerSearch",
 *           resultCategory: "Search Results",
 *           trackTemplate: "ServerSearchTrackTemplate.json",
 *           workflowScript: "ServerSearch.workflow.js",
 *           processScript:   'ServerSearchProcess.html'
 *       },
 *       services: {
 *           'serverSearchService': {name: 'serverSearchService',  type: 'service'}
 *       }
 *   }
 * 
 * Job queue entry:
 * ::      
 *    {
 *       "id": 113,
 *       "type": "workflow",
 *       "progress": "100",
 *       "priority": 0,
 *       "data": {
 *         "service": "serverSearchService",
 *         "dataset": "sample_data/json/volvox",
 *         "searchParams": {
 *           "expr": "atagt",
 *           "regex": "false",
 *           "caseIgnore": "true",
 *           "translate": "false",
 *           "fwdStrand": "true",
 *           "revStrand": "true",
 *           "maxLen": "100"
 *         },
 *         "name": "atagt search",
 *         "asset": "113_search_1513478281528",
 *         "path": "/var/www/html/4jbserver/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
 *         "outfile": "113_search_1513478281528.gff",
 *         "track": {
 *           "maxFeatureScreenDensity": 16,
 *           "style": {
 *             "showLabels": false
 *           },
 *           "displayMode": "normal",
 *           "storeClass": "JBrowse/Store/SeqFeature/GFF3",
 *           "type": "JBrowse/View/Track/HTMLFeatures",
 *           "metadata": {
 *             "description": "Search result job: 113"
 *           },
 *           "category": "Search Results",
 *           "key": "113 atagt results",
 *           "label": "113_search_1513478281528",
 *           "urlTemplate": "ServerSearch/113_search_1513478281528.gff",
 *           "sequenceSearch": true
 *         }
 *       },
 *       "state": "complete",
 *       "promote_at": "1513478280038",
 *       "created_at": "1513478280038",
 *       "updated_at": "1513478292634",
 *       "createdAt": "2018-02-01T05:38:27.371Z",
 *       "updatedAt": "2018-02-01T05:38:27.371Z"
 *     }
 * 
 * 
 */

var fs = require("fs-extra");
var approot = require("app-root-path");

var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;

module.exports = {

    fmap: {
        send_search_result:     'post'
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
        if (typeof params.searchParams === 'undefined') return "searchParams not defined";
        if (typeof params.searchParams.expr === 'undefined') return "search string undefined";
        return 0;   // success
    },
    /**
     * returns job service name
     * 
     * @param {type} params - parameters
     * @returns {string} -  
     */
    generateName(params) {
        return params.searchParams.expr+' search';
    },
    /**
     * Job service job start.
     * 
     * called when an appropriate jobs is found and exeuted by service.
     * 
     * @param {object} kJob
     */
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

        
        //thisb._createSearchParamFile(kJob);
        var error = false;
        try {
            if (!fs.existsSync(kJob.data.path)){
                fs.mkdirSync(kJob.data.path);
            }  
        }
        catch (err) {
            var msg = 'Failed to access/create dataset path: '+kJob.data.path;
            sails.log.error(msg,err);
            error = true;
        }
        if (error)    return kJob.kDoneFn(new Error(msg));  // error
        
        // delay 5 seconds for nothing, really (just so it sits in the queue for longer)
        setTimeout(function() {
            thisb._runWorkflow(kJob);
        },5000);
    },
    /*
     * Fix up regex search parameters.
     * 
     * @param {Object} s - search parameters.
     * @returns {object}
     */
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
    /*
     * run the ServerScript.workflow.js
     * 
     * @param (object} kWorkflowJob - kue job reference
     * 
     */
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
     * this generates the track definition from the track template
     * 
     * @param {object} kWorkflowJob - kue job reference
     * @param {object} cb - callback function
     * 
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

