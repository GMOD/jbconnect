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
var deepdiff = require("deep-object-diff").diff;
var _ = require('lodash');

module.exports = {

    attributes: {
        id: {
            type: 'integer',
            autoIncrement: false,
            unique: true,
            primaryKey: true
        }
    },
    
    _pick: ['id','type','options','active','progress','priority','data','state','max_attempts','promote_at','created_at','updated_at'],
    _state: ['active','complete','delayed','failed','inactive'],    // job states
    _queueName: "workflow",
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
        sails.log.info('job start');
        var g = sails.config.globals.jbrowse;
        var thisb = this;
        
        //sails.log("config",g);
        
        //kueTestService.init({},function() {
        //});
        
        //this.monitor();
        this.monitorTest();
        
        //thisb._listJobs();
        
        setTimeout(function() {
            //_test();
            thisb._syncJobs();
        },1000);

        // service process loop
        var gg = sails.config.globals;
        var queue = gg.kue_queue;
        
        
        setInterval(function() {
            gg.kue.Job.rangeByState( 'inactive', 0, 1000000, 'asc', function( err, kJobs ) {
                if (err) {
                    sails.log("process loop Job.rangeByState failed",err);
                    return;
                }
                //sails.log('kJobs',kJobs);
                //sails.log("job count",kJobs.length);
                if (kJobs.length) {
                    if (kJobs[0].type !== thisb._queueName) return;
                    
                    queue.process(thisb._queueName, function(job, done){
                        sails.log.info("service process starting: %s job %d",job.data.service,job.id);
                        var service = eval(job.data.service);
                        job.kDoneFn = done;
                        service.beginProcessing(job);
                    });
                }
            });
        },2000);
        
        
        function _test() {
            sails.log("***** testing *****");
            var queue = sails.config.globals.kue_queue;

            var job = queue.create(
                'email', {
                    title: 'welcome email for tj',
                    to: 'tj@learnboost.com',
                    template: 'welcome-email'
                }
            ).save( function(err){
                if ( err ) {
                    sails.log('job create error',err);
                    return;
                } 
                console.log( "job id created",job.id );

                return;
                setTimeout(function() {
                    console.log('2nd stage');  // we must add this line or _testdelete() is never called.  why?
                    _testdelete(job); 
                },2000);
            });
            
        }
        function _testdelete(job) {
            sails.log('deleteing job',job.id)
            job.remove(function(err){
              if (err) throw err;
              console.log('removed completed job #%d', job.id);
            });            
        }
        
        cb();

    },
    monitorTest: function() {
        var g = sails.config.globals;
        var thisB = this;
        
        sails.log(">>> Kue Test Monitor");
        
        g.kue_queue.on('job enqueue', function(id, data){
          thisB._processEvent('enqueue',id,data);
          thisB._createJob(id);
        });        
        g.kue_queue.on('job start', function(id, data){
          thisB._processEvent('start',id,data);
          thisB._updateJob(id);
        });        
        g.kue_queue.on('job failed', function(id, data){
          thisB._processEvent('failed',id,data);
          thisB._updateJob(id);
        });        
        g.kue_queue.on('job failed attempt', function(id, data){
          thisB._processEvent('failed-attempt',id,data);
          thisb._updateJob(id);
        });        
        g.kue_queue.on('job progress', function(id, data){
          thisB._processEvent('progress',id,data);
          thisB._updateJob(id);
        });        
        g.kue_queue.on('job complete', function(id, data){
          thisB._processEvent('complete',id,data);
          thisB._updateJob(id);
        });        
        g.kue_queue.on('job remove', function(id, data){
          thisB._processEvent('remove',id,data);
          thisB._destoryJob(id);
        });        
        g.kue_queue.on('job promotion', function(id, data){
          thisB._processEvent('promotion',id,data);
          thisB._updateJob(id);
        });        
    },
    _createJob: function(id) {
        var g = sails.config.globals;
        var thisB = this;
        
        g.kue.Job.get(id, function(err, kJob){
            if (err) {
                sails.log("_createJob Job.get failed",err);
                return;
            }
            var job1 = _.pick(kJob,thisB._pick);
            job1.state = kJob.state();
            job1.priority = kJob.priority();
            job1.progress = kJob.progress();
            //job1.active = job.active();
            //job1.options = job.options();
            
            Job.create(job1).then(function(created) {
               sails.log("sJob created",created.id); 
               Job.publishCreate(created);       // announce create

            }).catch(function(err) {
               sails.log("_createJob sJob create failed",err); 
            });
        });
        
    },
    _updateJob: function(id,data) {
        var g = sails.config.globals;
        var thisB = this;
        
        async.parallel({
            kJob: function(cb) {
                g.kue.Job.get(id, function(err, job){
                    if (err) {
                        sails.log("_updateJob Job.get failed",err);
                        cb(err,job);
                        return;
                    }
                    cb(null,job);
                });
            },
            sJob: function(cb) {
                Job.findOne({id:id}).then(function(found) {
                    cb(null,found); 
                }).catch(function(err) {
                    sails.log("_updateJob Job.findOne",id,err);
                    cb(err);
                });
            }
        },
        function completedParallel(err, r) {
            
            var diff = deepdiff(r.sJob,r.kJob);         // get differences between kJob and sJob
            diff = _.pick(diff,thisB._pick);    // eliminate unwanted

            diff.state = r.kJob.state();
            diff.priority = r.kJob.priority();
            diff.progress = r.kJob.progress();
            
            Job.update({id:r.sJob.id},diff).then(function(updated) {
               sails.log("_updateJob sJob updated",updated[0].id,updated[0]); 
               Job.publishUpdate(updated[0].id);       // announce update

            }).catch(function(err) {
               sails.log("_updateJob sJob update failed",err); 
            });
        });
    },
    _destoryJob: function(id) {
        var g = sails.config.globals;
        var thisB = this;
        Job.destroy(id).then(function(destroyed) {
            sails.log("_destoryJob sJob destroyed",id);
            Job.publishDestroy(id);       // announce destroy

        }).catch(function(err) {
            sails.log("_destoryJob sJob failed to destory",id);
        });
    },
    
    _processEvent:function(event,id,data) {
        var g = sails.config.globals;
        
        sails.log(">>> kue event",event,id,data);
    },
    /* 
     * display list of kue jobs ( used for debugging )
     * @returns {undefined}
     */
    _listJobs: function() {
        var g = sails.config.globals;
        
        // get kue jobs
        g.kue.Job.range( 0, 100000, 'asc', function( err, jobs ) {
            _.forEach(jobs, function(job) {
                console.log("kJob ",job.id);
            });
        });
        // get sails jobs
        Job.find({}).then(function(jobs) {
            _.forEach(jobs, function(job) {
                console.log(" sJob ",job.id);
            });
        }).catch(function(err) {
            console.log("faild Job.find()",err);
        });
    },
    /**
     * Synchronize all kue jobs (kJobs) and sails db jobs (sJobs)
     * Called upon initialization of the Job model
     * 
     * if the kJob exists but sJob does not, then create the sJob from kJob.
     * If the sJob exists but not kJob, then delete the sJob
     */
    _syncJobs: function() {
        var g = sails.config.globals;
        var thisb = this;

        // ToDo: potential mem blowup if queue gets to big
        
        // get all kJobs and sJobs
        async.parallel (
            {
                kJobs: function(cb) {
                    g.kue.Job.range( 0, 100000, 'asc', function( err, jobs ) {
                        if (err) return cb(err);
                        return cb(null,jobs);
                    });
                },
                sJobs: function(cb) {
                    Job.find({}).then(function(jobs) {
                        return cb(null,jobs);
                    }).catch(function(err) {
                        return cb(err);
                    });
                }
            },
            // the results are in r.sJobs and r.kJobs
            function(err,r) {
                if (err) return sails.log('_syncJobs failed',err);
                
                // map into assoc arrays for easier lookup.
                var kJobs = {}, sJobs = {};
                r.kJobs.forEach(function(job,i) { kJobs[job.id] = job;});
                r.sJobs.forEach(function(job,i) { sJobs[job.id] = job;});
                
                // display for debug
                for(var i in kJobs) console.log('+kJob',kJobs[i].id,i);
                for(var i in sJobs) console.log('-sJob',sJobs[i].id,i);
                
                // mark all sJobs deleted
                for(var i in sJobs) sJobs[i].delete = true;
                
                // if kJob element not in sJobs, create it in sJobs
                var createList = {};
                for(var i in kJobs) {
                    if (typeof sJobs[i] === 'undefined') createList[i] = kJobs[i];
                    else delete sJobs[i].delete;       // clear delete flag if both exist
                }
                async.eachLimit(createList,1000, function(job, cb) {
                    copyJob(job.id,function(err) {
                       if (err) return cb(err);
                       return cb();
                    });
                    
                }, function(err) {
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                        console.log.error('_syncJobs failed copies');
                        return;
                    }

                    destroyRemaining();
                });
                // copy sJob from kJob, given id
                function copyJob(id,cb) {

                    var job = kJobs[id];
                    var job1 = _.pick(job,thisb._pick);
                    job1.state = job.state();
                    job1.priority = job.priority();
                    job1.progress = job.progress();

                    //sJobs[id] =  job1;

                    Job.create(job1).then(function(created) {
                       sails.log("copyjob sJob created",job.id);
                       sJobs[i] = created;
                       //Job.publishCreate(created);                  // announce create
                       cb(null);
                    }).catch(function(err) {
                       sails.log("copyJob create failed",job.id, err);
                       return cb(err);
                    });
        
                }
                // delete any sJobs with delete flag remaining
                function destroyRemaining() {
                    for(var i in sJobs) {
                        if (sJobs[i].delete) {
                            sails.log("destroying sJob", i);
                            Job.destroy({id: sJobs[i].id}).then(function() {
                                sails.log("deleted sJob");
                                //Job.publishDestroy(destroyed.id);       // announce destroy
                            }).catch(function(err) {
                                sails.log.error("failed to delete from sJob",i,err);
                            });
                        }
                    }
                }
            }
        );
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
        
        sails.log(">>> kue event",event,id,data);
        
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
/*
function createOrUpdate2(kJob, mJob) {
    
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
*/
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
