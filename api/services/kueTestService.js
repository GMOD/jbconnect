/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* istanbul ignore file */
var async = require('async');

module.exports = {

    fmap: {
        kue_create:         'post',
        kue_delete:         'post',
        kue_delete_all:     'post',
        kue_test_case1:     'post'
    },
    init: function(params,cb) {
        //sails.log("kueTestService init");
        return cb();
    },
    kue_create: function(req, res) {
        var g = sails.config.globals;
        var thisB = this;
        
        var params = req.allParams();
        
        var job = g.kue_queue.create('thingo', {
            title: 'converting loki\'s to avi'
          , user: 1
          , frames: 200
        });
    },
    kue_delete: function(req, res) {
        var g = sails.config.globals;
        var thisB = this;
        
        var params = req.allParams();
        
        var job = g.kue_queue.create('thingo', {
            title: 'converting loki\'s to avi'
          , user: 1
          , frames: 200
        });
    },
    /*
     * delete all kue items from db
     */
    kue_delete_all: function(req, res) {
        var g = sails.config.globals;
        var queue = g.kue_queue;
        // get kue jobs
        g.kue.Job.range( 0, 100000, 'asc', function( err, jobs ) {
            if (err) {
                sails.log("/delete_all kJob.rangeByState",err);
                return;
            }
            // delete all jobs that are returned
            async.each(jobs,function eachJob(job,cb) {
                g.kue.Job.remove(job.id,function(err) {
                    if (err) {
                        sails.log("/delete_all: failed deleting",job.id,err);
                        return cb(err);
                    }
                    return cb();
                });
            }, function asyncAllDeletesCompleted (err) {
               if (err){
                   sails.log("failed deleting all jobs",err);
                   return;
               }
               sails.log("/delete_all: completed");
            });
        });
        
    },
    /*
     * create several kJob entries
     * no parameters
     */
    kue_test_case1: function(req,res) {
        var g = sails.config.globals;
        var jobs = [];
        var createList = [];
        for(var i=0;i<10;i++) createList.push(i);
        
        async.eachLimit(createList, 1000, function(dummy, cb) {    
            
            d = new Date();
            var jobdata = {
                thing1: "thing1 "+d,
                thing2: "thing2 "+d
            };
            var job = g.kue_queue.create('kue-test', jobdata)
            .save(function(err){
                if (err) {
                    sails.log('/create_test_case1: failed create',jobdata,err);
                    cb(err);
                    return;
                }
                jobs.push(job);
                
                // process job
                g.kue_queue.process('workflow', function(kJob, kDone){
                    kJob.kDoneFn = kDone;
                    sails.log.info("job id = "+kJob.id);

                    kJob.progress(0,10,{file_upload:0});
                });
            });
        }, function doneCreatingList(err) {
            if (err) 
                return sails.log("/create_test_case1: failed");
            
            sails.log('/create_test_case1: jobs created',jobs.length);
        });
    }

};

