/**
 * @module
 * @description
 * Dataset is a model that represents the JBrowse dataset.  Generally, this includes
 * path to the dataset and some of the data contained in trackList.json.
 * 
 * Datasets known to JBServer are defined in config/globals.js
 * (see: :ref:`jbs-globals-config`)
 *      
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 */

module.exports = {

    attributes: {
        path: {
            type: 'string',
            unique: true
        },
        tracks: {
            collection: 'track',
            via: 'id'
        }
    },
    /**
     * Initializes datasets as defined in config/globals.js.
     * (see: :ref:`jbs-globals-config`)
     * @param {function} cb - callback function 
     * @returns {undefined}
     */
    initialize: function(cb) {
        syncDatasets();
        
        // todo: need to handle this in callback
        cb();
    }
};

/**
 * Sync datasets, defined in globals with database.
 * 
 * todo: need to improve, perhaps use async?
 * 
 * @param (function) cb - callback function
 */
function syncDatasets(cb) {
    sails.log.debug('syncDatasets()');
    var g = sails.config.globals.jbrowse;
    
    // this will be an assoc array referenced by dataset id and path
    g.datasets = {};
    
    // these will be associative arrays
    var confItems = {};             // dataset items in globals.jbrowse.dataSet
    var modelItems = {};            // Dataset db items
    //sails.log('g.dataSet',g.dataSet);
    
    // convert to assoc array in confItems
    for(var i in g.dataSet) confItems[g.dataSet[i].dataPath] = true;
    
    Dataset.find({}, function(err,mItems) {
        if (err) {
            cb(err);
            return;
        }
        //sails.log('mItems',mItems);
        // convert to assoc array in modelItems
        for( var i in mItems) modelItems[mItems[i].path] = mItems[i];
        
        //for(var x in modelItems) sails.log('modelItem',x,modelItems[x]);
        
        // add or insert datasets
        for (var i in confItems) {
            if (typeof modelItems[i] !== 'undefined') {
                
                // create two references, one id based, one path-based
                g.datasets[i] = modelItems[i];
                g.datasets[modelItems[i].id] = modelItems[i];
                
                Track.syncTracks(modelItems[i]);
            }
            else {    
                Dataset.create({path:i},function(err, newDataset) {
                    if (err) {
                        var msg = 'failed to create dataset (it may exists) = path '+i;
                        cb({result: err, msg: msg});
                        return sails.log(msg);
                    }
                    //sails.log('dataset create',i);
                    
                    // create two refs
                    g.datasets[i] = newDataset;
                    g.datasets[newDataset.id] = newDataset;
                    
                    Track.syncTracks(newDataset);
                    
                    Dataset.publishCreate(newDataset);
                    
                });
            }
        }
        // delete datasets if they dont exist in config
        for (var j in modelItems) {
            //sails.log('confItem',modelItems[j],confItems[j]);
            //sails.log('exists confItems',i,typeof confItems[i]);
            if (typeof confItems[j] === 'undefined') {
                //sails.log('deleting dataset',j);
                Dataset.destroy({id:modelItems[j].id},function(err) {
                    if (err) {
                        var msg = 'dataset delete failed - id='+modelItems[j].id;
                        var err1 = {result:err,msg:msg};
                        cb(err1);
                        return (msg);
                    }
                    // notify listeners
                    Dataset.publishDestroy(modelItems[j]);
                });
            }
        }
        
    });
}
