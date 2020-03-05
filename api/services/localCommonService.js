/*
    This is a sample Job Service that is recognized by JBClient.

    To enable: add the sampleJobService line under services and disable the other services.

    module.exports  = {
        jbrowse: {
            services: {
                'sampleJobService':      {enable: true,  name: 'sampleJobService',   type: 'workflow'},
                'localBlastService':     {enable: false, name: 'localBlastService',  type: 'workflow', alias: "jblast"},
                'galaxyBlastService':    {enable: false, name: 'galaxyBlastService', type: 'workflow', alias: "jblast"}
            },
        }
    };

*/
const path = require('path');
const fs = require("fs-extra");
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
        let servModule = params.module;
        let wfpath = approot+'/workflows/';
        let filter = '.wf';
        
        console.log("localCommonService.get_workflows",params);

        if (g.workflowFilterEnable && g.workflowFilter && g.workflowFilter[servModule])
            filter = g.workflowFilter[servModule].filter;
        
        sails.log(wfpath,process.cwd());
        
        wflist = [];
        
        fs.readdirSync(wfpath).forEach(function(file) {
            if (file.indexOf(filter) !== -1) {
                
                var name = file.split(filter);
                
                wflist.push( {
                   id: file,
                   name: name[0],
                   script: file
//                   path: resolvePath(wfpath)
                });
            }
        });

        console.log("get_workflows",wflist);

        res.ok(wflist);
    },

    // (required by Job Runner Service)
    // this is called by the job execution engine to begin processing
    beginProcessing(kJob) {
        let thisb = this;
        let g = sails.config.globals.jbrowse;
        let tmpdir = approot+'/tmp';
        this.jobClass = kJob.data.workflow.split('.')[0];
        let jobName = kJob.id + '-'+this.jobClass;
        let wf = approot+'/workflows/'+kJob.data.workflow;
        let outPath = g.jbrowsePath + kJob.data.dataset + '/' + this.jobClass;

        let jobDataFile = tmpdir+'/'+jobName + '-jobdata.json'; 

        console.log('jobdata',JSON.stringify(kJob,null,2));

        //let nothingName = "sample nothing ";
        
        kJob.data.name = this.jobClass
        kJob.update(function() {});

        let jobData = _.clone(kJob.data);
        jobData.id = kJob.id;
        jobData.name = jobName;
        jobData.class = this.jobClass;      

        try {
            fs.ensureDirSync(tmpdir);
            fs.ensureDirSync(outPath);
            fs.writeFileSync(jobDataFile,JSON.stringify(jobData,null,2));
        }
        catch(err) {
            sails.log.error(err,jobDataFile);
            return kJob.kDoneFn(Error('workflow failed to open jobDataFile', jobDataFile));
        }

        sails.log('>>> Executing workflow',wf);
        
        const bat = spawn(wf,[kJob.id,jobName,jobDataFile,tmpdir,outPath]);

        bat.stdout.on('data', (data) => {
          console.log('+'+data.toString());
        });
        bat.stderr.on('data', (data) => {
          console.error('+'+data.toString());
          kJob.update(function() {});
          return kJob.kDoneFn(Error('workflow script failed', jobDataFile));
        });
        bat.on('exit', (code) => {
          console.log(`+Child exited with code ${code}`);
          kJob.update(function() {});
          thisb._postProcess(kJob);
        });        

    },

    //  (not required)
    //  After the job completes, we do some processing in postDoNothing() and then call 
    //  addToTrackList to insert a new track into JBrowse
    _postProcess(kJob) {
        
        // insert track into trackList.json
        this.insertTrack(kJob,function(newTrackJson) {
            postAction.addToTrackList(kJob,newTrackJson);
        });
    },

    //  (not required)
    //  here, we do some arbitrary post prosessing.
    //  in this example, we are setting a dummy jbrowse track data.    
    insertTrack(kJob,cb) {

        let templateFile = approot+'/workflows/'+this.jobClass+'.TrackTemplate.json';
        let newTrackJson = [JSON.parse(fs.readFileSync(templateFile))];

        let trackLabel = kJob.id+' '+kJob.data.name+' job results';
        //newTrackJson[0].category = kJob.name,
        newTrackJson[0].label = kJob.data.name+"_"+kJob.id+'-'+Math.random(); 
        newTrackJson[0].key = trackLabel;     
        newTrackJson[0].urlTemplate = kJob.data.name+'/'+kJob.id+'-'+kJob.data.name+'.gff3',

        kJob.data.track = newTrackJson[0];
        kJob.update(function() {});

        cb(newTrackJson);
    }
    
};
