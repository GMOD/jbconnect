/**
 * @module
 * @description
 * JobActive holds a count of the number of active jobs.
 * It only contains one record that gets updated when the number of active jobs changes.
 * A timer thread monitors the job queue for active jobs and updates the JobActive record
 * with any changes to the number of active jobs.
 * Subscribers to the record (clients) will get notification.
 * JBClient plugin uses this to determine if a job is active and changes the activity icon
 * of the job queue panel.
 * 
 * JobActive object example:
 * ::
 *   {
 *     "active": 0,
 *     "createdAt": "2017-11-23T00:53:41.864Z",
 *     "updatedAt": "2018-02-07T07:59:32.471Z",
 *     "id": 1
 *   } 
 */


module.exports = {

    /**
     * initialize starts the job active monitor
     * 
     * @param {object} params - value is ignored
     * @param {type} cb - callback ``function cb(err)`` 
     *    
     */
    Init: function(params,cb) {
        this._activeMonitor();
        cb();
    },
    /**
     * Get list of tracks based on critera in params  
     * 
     * @param {object} params - search critera (i.e. ``{id: 1,user:'jimmy'}`` )
     * @param {function} cb - callback ``function(err,array)``
     * 
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    /*
     * Monitors how many active jobs there are.
     */
    _lastActiveCount: 0,
    _activeMonitor: function() {
        sails.log.info("Active Job Monitor starting");
        var g = sails.config.globals;
        var thisb = this;
        var queue = g.kue_queue;
        
        queue.activeCount(Job._queueName, function( err, total ) {
            console.log("active count",total);
            thisb._lastActiveCount = total;
            writeActive(total);
        });
        
        setInterval(function() {
            //console.log("active mon");
            queue.activeCount(Job._queueName, function( err, total ) {
                //console.log("active count",total);
                if (total !== thisb._lastActiveCount) {
                    console.log("active job count",total);
                    thisb._lastActiveCount = total;
                    writeActive(total);
                }
            });
        },2000);
        
        function writeActive(val) {
            JobActive.updateOrCreate({id:1},{active:val}).then(function(record) {
                //sails.log('active written',record);
                JobActive.publishUpdate(1,record);
            }).catch(function(err) {
                sails.log('writeActive() error writing active job flag', err);
            });
            
        }
    },

};