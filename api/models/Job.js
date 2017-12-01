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

var async = require('async');
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
    _eventList: [],
    _eventProc: 0,
    
    /**
     * start the monitor
     * 
     */
    Init: function(params,cb) {
        sails.log.info('Job Engine Starting');
        var g = sails.config.globals.jbrowse;
        var thisb = this;
        
        //this.monitor();
        this._kueEventMonitor();
        
        //thisb._listJobs();
        
        setTimeout(function() {
            thisb._syncJobs();
            thisb._jobRunner();
            JobActive.Init(null,function() {});
            //_debug1();
        },1000);
        
        // display methods in Job
        function _debug1() {
            var fs = require('fs-extra');
            console.log("debug1 - listing JobActive functions");
            var li = Object.getOwnPropertyNames(JobActive).filter(function (p) {
                return typeof JobActive[p] === 'function';
            });
            var li2 = "";
            for(var i in li) li2 += li[i]+'\n';
            fs.writeFileSync("Job-Methods.log",li2);
        }
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
    /**
     * Get list of tracks based on critera in params  
     * @param {object} params - search critera (i.e. {id: 1,user:'jimmy'} )
     * @param {function} cb - callback function(err,array)
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    Submit: function(param,cb) {
        
    },
    _jobRunner: function() {
        sails.log.info("Job Runner Started");
        var gg = sails.config.globals;
        var queue = gg.kue_queue;
        var thisb = this;
        
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
    },
    _kueEventMonitor: function() {
        var g = sails.config.globals;
        var thisB = this;
        /*  for debugging
        setInterval(function() {
            console.log('_eventProc',thisB._eventProc,thisB._eventList.length);
        },3000);
        */
        sails.log.info("Kue Event Monitor started");
        
        g.kue_queue.on('job enqueue', function(id, data){
          thisB._pushEvent('enqueue',id,data,'create');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job start', function(id, data){
          thisB._pushEvent('start',id,data,'update');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job failed', function(id, data){
          thisB._pushEvent('failed',id,data,'update');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job failed attempt', function(id, data){
          thisB._pushEvent('failed-attempt',id,data,'update');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job progress', function(id, data){
          thisB._pushEvent('progress',id,data,'update');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job complete', function(id, data){
          thisB._pushEvent('complete',id,data,'update');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job remove', function(id, data){
          thisB._pushEvent('remove',id,data,'remove');
          thisB._processNextEvent();
        });        
        g.kue_queue.on('job promotion', function(id, data){
          thisB._pushEvent('promotion',id,data,'update');
          thisB._processNextEvent();
        });        
    },
    /*
     * the push event framework ensures that only one event is processed at a time.
     * @param {type} event
     * @param {type} id
     * @param {type} data
     * @returns {undefined}
     */
    _pushEvent:function(event,id,data,evx) {
        sails.log(">>> kue push event",event,id,data);
        this._eventList.push({event:event,evx:evx,id:id,data:data});
    },
    _processNextEvent: function() {
        var thisb = this;
        
        // don't do anything if we are already processing an event
        if (thisb._eventProc) return;
        
        // exit if there are no events to process
        if (thisb._eventList.length <= 0) return;
        
        thisb._eventProc++;
        
        var ev = thisb._eventList.shift();
        
        // consolidate update events into a single update event
        /*
        if (ev.evx==='update' && thisb._eventList.length) {
            while (thisb._eventList[0].evx === 'update')
                this.b_eventList.shift();
        }
        */
        sails.log('>>> process job event',ev.id,ev.event,ev.data);
        
        switch(ev.event) {
            case 'enqueue':
                thisb._createJob(ev.id,function(err){
                    thisb._eventProc--;
                    sails.log(">>> process job event create completed");
                    thisb._processNextEvent();
                });
                break;
            case 'remove':
                thisb._destroyJob(ev.id,function(err) {
                    thisb._eventProc--;
                    sails.log(">>> process job event destroy completed");
                    thisb._processNextEvent();
                });
                break;
            default:
                thisb._updateJob(ev.id,function(err) {
                    thisb._eventProc--;
                    sails.log(">>> process job event update completed");
                    thisb._processNextEvent();
                });
        }
    },
    _createJob: function(id,cb) {
        var g = sails.config.globals;
        var thisB = this;
        
        g.kue.Job.get(id, function(err, kJob){
            if (err) {
                sails.log("_createJob Job.get failed",err);
                return;
            }
            var job1 = {};  //_.pick(kJob,thisB._pick);
            job1.id = kJob.id;
            job1.state = kJob.state();
            job1.priority = kJob.priority();
            job1.progress = kJob.progress();
            job1.data = kJob.data;
            
            Job.create(job1).then(function(created) {
               sails.log("sJob created",created.id); 
               Job.publishCreate(created);       // announce create
               cb()

            }).catch(function(err) {
               sails.log("_createJob sJob create failed",err);
               cb(err);
            });
        });
        
    },
    _updateJob: function(id,cbx) {
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
            
            if (err) {
                sails.log.error('_updateJob failed',r,err);
                return;
            }
            
            //var datadiff = deepdiff(r.sJob.data,r.kJob.data);         // get differences between kJob and sJob
            //diff = _.pick(diff,thisB._pick);    // eliminate unwanted

            var diff = {};
            diff.state = r.kJob.state();
            diff.priority = r.kJob.priority();
            diff.progress = r.kJob.progress();
            diff.data = r.kJob.data;
            
            //if (typeof r.sJob === 'undefined') sails.log.error('value r',r);
            if (typeof r.sJob.id === 'undefined') {
                sails.log.error("_updateJob undefined id",r.sJob,diff);
                return cbx('_updateJob undefined id');
            }
            else {
                Job.update({id:r.sJob.id},diff).then(function(updated) {
                   //sails.log("_updateJob sJob updated",updated[0].id,updated[0]); 
                   Job.publishUpdate(updated[0].id,updated[0]);       // announce update
                   return cbx();

                }).catch(function(err) {
                   sails.log("_updateJob sJob update failed",err);
                   return cbx(err);
                });
            }
        });
    },
    _destroyJob: function(id,cb) {
        var g = sails.config.globals;
        var thisB = this;
        
        Job.destroy(id).then(function(destroyed) {
            sails.log("_destoryJob sJob destroyed",id);
            Job.publishDestroy(id);       // announce destroy
            return cb();

        }).catch(function(err) {
            sails.log("_destoryJob sJob failed to destory",id);
            return cb(err);
        });
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
                //for(var i in kJobs) console.log('+kJob',kJobs[i].id,i);
                //for(var i in sJobs) console.log('-sJob',sJobs[i].id,i);
                
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
    /*
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
    */
    /**
     * Sync kue[workflow] with Job model
     * 
     */
    /*
    syncJobs: function() {
        syncJobs();
    },
    */
    /**
     * Send a Job framework event
     * 
     * @param {type} event
     * @param {type} id
     * @param {type} data
     */
    /*
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
    */
    /*
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
    */
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
/*
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
*/