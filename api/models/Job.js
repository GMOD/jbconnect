/**
 * @module
 *
 * @description
 * Job model is an encapsulation of the `Kue <https://automattic.github.io/kue/>`_ job framework.
 * 
 * Kue uses `redis <https://redis.io/>`_ database.  This model synchronizes the Job database with the redis data
 * through the use of Kue's API.
 * 
 * Kue event messages are stuffed into a FIFO `_eventList` and dequeued with `_processNextEvent` to ensure order.
 *       * **Example Job object:**
 * ::
 * 
 *   {
 *       "id": 113,
 *       "type": "workflow",
 *       "progress": "100",
 *       "priority": 0,
 *       "data": {
 *         "service": "serverSearchService",
 *         "dataset": "sample_data/json/volvox",
 *         "searchParams": {
 *           "expr": "ttt",
 *           "regex": "false",
 *           "caseIgnore": "true",
 *           "translate": "false",
 *           "fwdStrand": "true",
 *           "revStrand": "true",
 *           "maxLen": "100"
 *         },
 *         "name": "ttt search",
 *         "asset": "113_search_1513478281528",
 *         "path": "/var/www/html/jbconnect/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
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
 *           "key": "113 ttt results",
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
 * **Event Mappings:**
 * 
 * +----------------------------+----------------+
 * | Kue Events                 | Job Events     |
 * +============================+================+
 * | * queue-enqueue            | create         |
 * +----------------------------+----------------+
 * | * queue-start              | update         |
 * +----------------------------+----------------+
 * | * queue-failed             | update         |
 * +----------------------------+----------------+
 * | * queue-failed-attempt     | update         |
 * +----------------------------+----------------+
 * | * queue-progress           | update         |
 * +----------------------------+----------------+
 * | * queue-complete           | update         |
 * +----------------------------+----------------+
 * | * queue-remove             | remove         |
 * +----------------------------+----------------+
 * | * queue-promotion          | unused         |               
 * +----------------------------+----------------+
 * 
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 */

const async = require('async');
const _ = require('lodash');
const fetch = require('node-fetch');

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
            //_debugPushEvents();
            //_debug1();
        },1000);
        
        // display methods in Job
        // istanbul ignore next
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
        // istanbul ignore next
        function _testdelete(job) {
            sails.log('deleteing job',job.id);
            job.remove(function(err){
              if (err) throw err;
              console.log('removed completed job #%d', job.id);
            });            
        }
        // istanbul ignore next
        function _debugPushEvents() {
            var t1 = setInterval(function() {
                if (sails.exiting) {
                    console.log("clear interval _debugPushEvents()");
                    clearInterval(t1);
                }
                
                console.log('_eventProc',thisb._eventProc,thisb._eventList.length);
            }, 3000);
        }
        
        cb();

    },
    /**
     * Get list of tracks based on critera in params
     *   
     * @param {object} params - search critera (i.e. ``{id: 1,user:'jimmy'}`` )
     * @param {function} cb - callback function(err,array)
     * 
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList); 
        }).catch(function(err){
            // istanbul ignore next
            return cb(err);
        });
    },
    /**
     * 
     * @param {int} id - id of the item to be removed
     * @param (function) cb - callback function(err,
     */
    Remove: function(params,cb) {
        let thisb = this;
        let g = sails.config.globals.jbrowse;
        if (_.isUndefined(params.id)) return cb("id not defined");
        let id = params.id;
		
		let url = g.jbrowseRest+'/api/job/'+id;
		fetch(url, { method: 'DELETE'})
		.then(res => res.json()) // expecting a json response
		.then(json => {
			console.log("Job DELETE result",json);
			return cb(null,json);
		})
		.catch(function(err) {
			return cb(err);
		});
		
	},
    /*
     * Submit a job to the job queue
     * 
     * required: 
     *      service, dataset
     *      
     * @param {object} params - parameters
     * @param {function} cb - ``function(err,returndata)``
     * 
     */
    Submit: function(params,cb) {
        
        //sails.log('Job.Submit',params);
        
        // validate the service
        var err = Service.ValidateJobService(params.service); 
        // istanbul ignore next
        if (err) {
            sails.log.error(err);
            return cb(err);
        }
        var service = Service.Resolve(params.service);
        // istanbul ignore next
        if (!service) {
            sails.log.err('Submit - invalid service name',params.service);
            return cb('invalid service');
        }
    
        // validate service specific parameters
        err = service.validateParams(params);
        // istanbul ignore next
        if (err) {
            sails.log.error(err);
            return cb(err);
        }

        var jobdata = params;
        
        // generate name
        jobdata.name = service.generateName(params);
        //jobdata.searchParams = this._fixParams(jobdata.searchParams);  // necessary?
        //jobdata.dataset = {path:jobdata.dataset};

        // create queue entry
        
        var g = sails.config.globals;
        var kJob = g.kue_queue.create(this._queueName, jobdata);
        
        kJob.save(function(err){
            // istanbul ignore next
            if (err) {
                var msg = "failed to create job entry in queue";
                return cb({status:'error',msg: "Error create kue workflow",err:err});
            }
            cb(0,{status:'success',jobId: kJob.id});
        });
        
    },
    /*
     *  This background process looks for queue entries that are ready to process and calls the beginProcessing() of the service.
     *  This is the thing that starts service processing.
     */
    _jobRunner: function() {
        sails.log.info("Job Runner Started");
        var gg = sails.config.globals;
        var queue = gg.kue_queue;
        var thisb = this;
        
        let t1 = setInterval(function() {
            if (sails.exiting) {
                console.log("clear interval _jobRunner");
                clearInterval(t1);
            }
                
            gg.kue.Job.rangeByState( 'inactive', 0, 1000000, 'asc', function( err, kJobs ) {
                // istanbul ignore next
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
                        //var service = eval(job.data.service);
                        var service = Service.Resolve(job.data.service);
                        job.kDoneFn = done;
                        // istanbul ignore else
                        if (service) {
                            service.beginProcessing(job);
                        }
                        else {
                            var msg = "Job runner - Undefined service "+job.data.service;
                            sails.log.error(msg);
                            job.kDone(new Error(msg));
                            
                        }
                    });
                }
            });
        },2000);
    },
    /*
     * subscribe to kue events and translates them to sails events
     */
    _kueEventMonitor: function() {
        var g = sails.config.globals;
        var thisB = this;
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
            // istanbul ignore next
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
            if (kJob._error) job1.error = kJob._error;
            
            Job.create(job1).then(function(created) {
               sails.log("sJob created",created.id); 
               Job.publishCreate(created);       // announce create
               cb();

            }).catch(function(err) {
                /* istanbul ignore next */ if (true) {
                sails.log("_createJob sJob create failed",err);
                cb(err);
                }
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
                    /* istanbul ignore next */ if (true) {
                    sails.log("_updateJob Job.findOne",id,err);
                    cb(err);
                    }
                });
            }
        },
        function completedParallel(err, r) {
            
            // istanbul ignore next
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
            if (r.kJob._error) diff.error = r.kJob._error;
            
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
                    // istanbul ignore next
                    if (true) {
                    sails.log("_updateJob sJob update failed",err);
                    return cbx(err);
                    }
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
            // istanbul ignore next
            if (true) {
            sails.log("_destoryJob sJob failed to destory",id);
            return cb(err);
            }
        });
    },
    
    /* 
     * display list of kue jobs ( used for debugging )
     * @returns {undefined}
     */
    // istanbul ignore next
    _listJobs() {
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
            // istanbul ignore next
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
                for(i in kJobs) {
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
                    // istanbul ignore
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
                    if (job._error) job1.error = job._error;

                    //sJobs[id] =  job1;

                    Job.create(job1).then(function(created) {
                       sails.log("copyjob sJob created",job.id);
                       sJobs[i] = created;
                       //Job.publishCreate(created);                  // announce create
                       cb(null);
                    }).catch(function(err) {
                        // istanbul ignore next
                        if (true) {
                        sails.log("copyJob create failed",job.id, err);
                        return cb(err);
                        }
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
                                // istanbul ignore next
                                sails.log.error("failed to delete from sJob",i,err);
                            });
                        }
                    }
                }
            }
        );
    }
};
