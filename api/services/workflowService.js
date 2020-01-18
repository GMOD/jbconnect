/*
    This is a sample Job Service that is recognized by JBClient.

    To enable: add the sampleJobService line under services and disable the other services.

    module.exports  = {
        jbrowse: {
            services: {
                'sampleJobService':         {enable: true,  name: 'sampleJobService    ',  type: 'workflow', alias: "jblast"},
                'basicWorkflowService':     {enable: false, name: 'basicWorkflowService',  type: 'workflow', alias: "jblast"},
                'galaxyService':            {enable: false, name: 'galaxyService',         type: 'workflow', alias: "jblast"}
            },
        }
    };

*/
const path = require('path');
const fs = require("fs-extra");
const resolvePath = require('resolve-path');
const approot = require("app-root-path");
const shelljs = require('shelljs'); 
const _ = require('lodash');
const { exec, spawn } = require('child_process');

module.exports = {

    //  in the function map (fmap), get_workflow function is minimally require from the Process BLAST dialog.
    //  get_hit_details is not required since we don't actaully do a blast operation in the example.
    fmap: {
        get_workflows:      'get'
    },

    //  (required by Job Service)
    //  perform any initialization on the module
    init(params,cb) {
        return cb();
    },

    //  (required by Job Runner Service)
    //  provides mechanism to validate parameters of the job service
    validateParams(params) {
        if (typeof params.region === 'undefined') return "region not undefined";
        return 0;   // success
    },

    //  (required by Job Runner Service)
    //  job service generate readable name for the job that will appear in the job queue
    generateName(params) {
        return params.workflow;
    },

    //  (required by Job Runner Service)
    //  Return a list of available workflow scripts.  This is used to populate the Plugin's workflow.
    //  This should minimally return at least one item.
    //  Here, we are just passing a dummy list.
    get_workflows (req, res) {
        
        let params = req.allParams();
        let g = sails.config.globals.jbrowse;
        let ds = params.dataset;
        
        var wfpath = './workflows/';
        
        sails.log(wfpath,process.cwd());
        
        var fs = require('fs-extra');

        wflist = [];
        
        fs.readdirSync(wfpath).forEach(function(file) {
            if (file.indexOf('.wf.') !== -1) {
                
                var name = file.split('.wf.');
                
                wflist.push( {
                   id: file,
                   name: name[0],
                   script: file,
                   path: resolvePath(wfpath)
                });
            }
        });

        // handle filtering of workflow names (ref #225)
        // if (g.jblast.workflowFilterEnable && g.jblast.workflowFilter && g.jblast.workflowFilter.galaxy && g.jblast.workflowFilter.galaxy[ds]) {
        //     let workflows = _.cloneDeep(wflist);
        //     let nf = g.jblast.workflowFilter.galaxy[ds].nameFilter;
        //     let filtered = [];
            
        //     for(let i in workflows) {
        //         if (workflows[i].name.indexOf(nf) >= 0) {
        //             workflows[i].name = workflows[i].name.replace(nf,"");
        //             filtered.push(workflows[i]);
        //         }
        //     }
        //     console.log("get_workflows filtered",filtered);
        //     return res.ok(filtered);
        // }
        
        console.log("get_workflows",wflist);

        res.ok(wflist);
    },

    // (required by Job Runner Service)
    // this is called by the job execution engine to begin processing
    beginProcessing(kJob) {
        let thisb = this;
        let g = sails.config.globals.jbrowse;

        let wf = approot+'/workflows/'+kJob.data.workflow;
        //var outPath = g.jbrowsePath + kJob.data.dataset + '/' + g.jblast.blastResultPath;

        let nothingName = "sample nothing ";
        
        kJob.data.count = 10;   // 10 seconds of nothing

        sails.log('>>> Executing workflow',wf);
        const bat = spawn(wf);

        bat.stdout.on('data', (data) => {
          console.log('+'+data.toString());
        });
        bat.stderr.on('data', (data) => {
          console.error('+'+data.toString());
          kJob.update(function() {});
        });
        bat.on('exit', (code) => {
          console.log(`+Child exited with code ${code}`);
          kJob.update(function() {});
          thisb._postProcess(kJob);
        });        


        // let f1 = setInterval(function() {
        //     if (kJob.data.count===0) {
        //         clearInterval(f1);
        //         thisb._postProcess(kJob);
        //     }
        //     kJob.data.name = nothingName+kJob.data.count--;
        //     kJob.update(function() {});
        // },1000);
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
    _runWorkflow: function(kJob) {

        var thisb = this;
        var g = sails.config.globals.jbrowse;

        var wf = appPath+'/workflows/'+kJob.data.workflow;
        var outPath = g.jbrowsePath + kJob.data.dataset + '/' + g.jblast.blastResultPath;

        sails.log('>>> Executing workflow',wf);
        
        let optionFile = appPath + kJob.data.blastOptionFile;

        let cmd = 'node '+ wf + ' --in '+kJob.data.blastData.blastSeq + ' --ext blastxml --out '+outPath+' --profile '+optionFile;
        sails.log.debug("cmd",cmd);

        var child = shelljs.exec(cmd,{async:true},
            function(code, stdout, stderr) {
                // istanbul ignore next
                if (code !== 0) {    // completed in error
                    console.log('Script Exit code:', code, typeof code);
                    console.log('Script Program stderr:', stderr);                
                }
                console.log('Script output [[[[', stdout,']]]]');

                // if no workflowResults terminate
                // istanbul ignore next
                if (stdout.indexOf("workflowResults:") === -1) {
                    sails.log.error("failed to find workflow results");
                    return kJob.kDoneFn(Error('workflow failed -', stdout));
                }
                
                // extract workflow results
                var results = extractjson(stdout);
                if (results===false)    return kJob.kDoneFn(Error('workflow failed'));

                // the script may generate any number of files so we rely on the script results to tell us the generated file
                
                kJob.data.workflowResult = results;
                kJob.data.blastData.outputs = { blastxml: kJob.id+"_" + Date.now() };
                kJob.update(function() {});
                
                // rename the generated file to be the asset id 
                // this is a clunky should be improved.
                //console.log(">>>>> renaming file asset",results.out);
                renamefile(results.out);
                
                // start post processing.
                thisb._postProcess(kJob);
                
                // extract the json from the result string
                function extractjson(str) {
                    let results = null;
                    try {
                        let jstr = str.split("workflowResults:")[1];
                        console.log(">>>>> workflowresults",jstr);
                        results = JSON.parse(jstr);
                    }
                    catch(err) {
                        sails.log.error("extractjson() failed", err);
                        return false;   
                    }
                    return results;
                }
                // rename to file asset name
                function renamefile(theFile) {
                    var dir = path.dirname(theFile);
                    var ext = path.extname(theFile);
                    var assetid = kJob.data.blastData.outputs.blastxml;
                    var cmd = "mv "+theFile+" "+dir+"/"+assetid+ext;
                    sails.log(cmd);
                    shelljs.exec(cmd);
                }
            }
        );
        //sails.log('>>> Workflow complete');
        
    },

    //  (not required)
    //  here, we do some arbitrary post prosessing.
    //  in this example, we are setting a dummy jbrowse track data.    
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
    
};
