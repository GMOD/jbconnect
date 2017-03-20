
module.exports = {
    start: function() {
        sails.log.info('kue job monitor starting');
        var thisB = this;
        setTimeout(function() {
            thisB.monitor();
            //thisB.test();
        },1000);

    },
    monitor: function() {
        var g = sails.config.globals;
        var thisB = this;
        var lastActiveCount = -1;

        // notify if detect active galaxy-workflow-watch count changed
        setInterval(function() {
            g.kue.Job.rangeByType('galaxy-workflow-watch', 'active', 0 , n, 'asc', function(err, kJobs) {

                // report changes in active count
                if (kJobs.length !== lastActiveCount) {
                    sails.log.info("queue event active count "+kJobs.length);
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
     * queue-enqueue
     * queue-start
     * queue-failed
     * queue-failed-attempt
     * queue-progress
     * queue-complete
     * queue-remove
     * queue-promotion
     * 
     * @param {type} event
     * @param {type} id
     * @param {type} data
     * @returns {undefined}
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
                    progress: data
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
}




