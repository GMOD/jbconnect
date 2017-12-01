/* 
 */


module.exports = {
    
    Init: function(params,cb) {
        this._activeMonitor();
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
    /*
     * Monitors how many active jobs there are.
     * Writes 
     * @returns {undefined}
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
                sails.log('active written',record);
                JobActive.publishUpdate(1,record);
            }).catch(function(err) {
                sails.log('writeActive() error writing active job flag', err);
            });
            
        }
    },

};