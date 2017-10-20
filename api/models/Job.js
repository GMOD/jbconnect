/**
 * @module
 *
 * @description
 * Job model is an encapsulation of the `Kue <https://automattic.github.io/kue/>`_ job framework.
 * 
 * Kue uses `redis <https://redis.io/>`_ database.  This model synchronizes the Job database with the redis data
 * through the use of Kue's API.
 *  
 * Events
 * 
 * +----------------------------+
 * | * queue-enqueue            |
 * | * queue-start              |
 * | * queue-failed             |
 * | * queue-failed-attempt     |
 * | * queue-progress           |
 * | * queue-complete           |
 * | * queue-remove             |
 * | * queue-promotion          |
 * +----------------------------+
 * 
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 */

//var deepdiff = require('deep-diff');
//var deepcopy = require('deepcopy');
var request = require('request');
var async = require('async');
module.exports = {

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: false,
            unique: true,
            primaryKey: true
        }
    },
    
    /**
     * Obsolete
     *  
     */
    initialize: function() {
        // first time initialize: set error for any active jobs.
    },
    
    /**
     * start the monitor
     * 
     */
    start: function(cb) {
        sails.log.info('starting kue job monitor');
        this.monitor();
        cb();

    },
    /**
     * monitor events from the kue framework and translate to Job events
     */
    monitor: function() {
        var g = sails.config.globals;
        var thisB = this;
        var lastActiveCount = -1;
        var n = 1000000;

        // notify if detect active workflow count changed
        setInterval(function() {
            g.kue.Job.rangeByType('workflow', 'active', 0 , n, 'asc', function(err, kJobs) {

                // report changes in active count
                if (kJobs.length !== lastActiveCount) {
                    sails.log.info(">>> queue event active count "+kJobs.length);
                    sails.hooks['jbcore'].sendEvent("queue-active",{count:kJobs.length});
                    lastActiveCount = kJobs.length;
                }
            });
        },2000);

        g.kue_queue.on('job enqueue', function(id, data){
          thisB.processEvent('enqueue',id,data);
        });        
        g.kue_queue.on('job start', function(id, data){
          thisB.processEvent('start',id,data);
        });        
        g.kue_queue.on('job failed', function(id, data){
          thisB.processEvent('failed',id,data);
        });        
        g.kue_queue.on('job failed attempt', function(id, data){
          thisB.processEvent('failed-attempt',id,data);
        });        
        g.kue_queue.on('job progress', function(id, data){
          thisB.processEvent('progress',id,data);
        });        
        g.kue_queue.on('job complete', function(id, data){
          thisB.processEvent('complete',id,data);
        });        
        g.kue_queue.on('job remove', function(id, data){
          thisB.processEvent('remove',id,data);
        });        
        g.kue_queue.on('job promotion', function(id, data){
          thisB.processEvent('promotion',id,data);
        });        
    },
    /**
     * Sync kue[workflow] with Job model
     * 
     */
    syncJobs: function() {
        syncJobs();
    },
    /**
     * Send a Job framework event
     * 
     * @param {type} event
     * @param {type} id
     * @param {type} data
     */
    processEvent: function(event,id,data) {
        var g = sails.config.globals;
        
        g.kue.Job.get(id, function(err, job){
            if (err) return;
            if (job.type==='galaxy-job') return;    // ignore galaxy-job

            var job1 = job;
            
            // if progress message, abreviate payload
            if (event==='progress') {
                job1 = {
                    id: job.id,
                    type: job.type,
                    progress: data,
                    data: { name: job.data.name }
                };
            }


            sails.hooks['jbcore'].sendEvent('queue-'+event,job1);
            
            sails.log.info( '[kueJobMon] %s, %s id=%s, data %s',job.type,event, id, data );
            
        });
        
    },
    
    test: function() {
        sails.log("kueJobMon starting test");
        
        var g = sails.config.globals;

        var job = g.kue_queue.create('test-email', {
            title: 'welcome email for tj'
          , to: 'tj@learnboost.com'
          , template: 'welcome-email'
        }).save( function(err){
           if( !err ) console.log( 'kueJobMon test error',job.id );
        });

        setTimeout(function() {
            g.kue_queue.process('test-email', function(job, done){
              //emailx(job.data.to, done);
              var count = 0;
              var max = 7;
              var j = setInterval(function() {
                  //done();
                  job.progress(count, max, {nextSlide : count+1});
                  if (count++ === max){
                    clearInterval(j);
                    done(new Error('whoa error dude'));
                  }  
              },1000);
            });
        },2000);
        
    }
    
};
/**
 * Create or update a job in the sails framework based on kue job data
 * 
 * @param (object}  kJob - Kue framework job
 * @param {object}  mJob - Sails framework job
 */
function createOrUpdate(kJob, mJob) {
    
    sails.log('createOrUpdate() job',kJob.id);
    
    var toPick = ['id','promote_at','created_at','updated_at',
        'failed_at','started_at','duration,data','progress_data',
        'type','data','type','priority','progress','state','attempts','workerId','attempts','active','selected'];
    var toOmit = ['createdAt','updatedAt'];
    var kJob1 = _.pick(kJob,toPick);

    if (typeof mJob !== 'undefined') {
        var mJob1 = _.pick(mJob,toPick);
        if (!_.isEqual(mJob1,kJob1)) {
            
            sails.log('>>> not equal',kJob.id); //,deepdiff(mJob1,kJob1),'\n\nmJob',mJob1,'\n\nkJob',kJob1);
            
            
            Job.update({id:kJob.id},kJob1,function(err,updatedJob) {
                if (err) sails.log('error sync job up0date',err);
                sails.log("post update Job",updatedJob.length,typeof updatedJob);
                Job.publishUpdate(updatedJob[0].id,updatedJob[0]);
                sails.log("Job updated",updatedJob[0].id);
            });
            
        }
        else sails.log('>>> isequal do nothing',kJob.id);

    }
    else {
        // does not exist, create
        Job.create(kJob1,function(err,newJob) {
            if (err) sails.log('error sync job create',err);
            Job.publishCreate(newJob);
            sails.log("Job created",newJob.id);
        });
    }
}

/**
 * Synchronize Jobs with the Kue framework
 * 
 */
function syncJobs() {
    var g = sails.config.globals;
    request({url:g.jbrowse.jbrowseRest+'/api/jobs/0..100000',json:true}, function (err, res, found) {
        if (err) sails.log('error getting kue jobs',err)
    
        var kJobs = {};
        var list = [];
        for(var i in found) {
            if (kJobs[i].type === 'workflow') {
                sails.log('job item',i,kJobs[i].id);
                kJobs[found[i].id] = _.cloneDeep(found[i]);
            }
        }
        found = null;
        
        if (list.length) {
            
            async.
            
            Job.find({id:list},function(err,mJobs) {
                if (err) sails.log('error find mJob',err);

                sails.log('found mjob items',mJobs.length);
                
                //createOrUpdate(kJobs[i],mJob);
            });
         }
    });
}
