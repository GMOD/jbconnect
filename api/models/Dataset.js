/**
 * Dataset.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
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
    initialize: function(cb) {
        syncDatasets();
        cb();
    }
};

/**
 * sync globals globals.jbrowse.dataSet with Dataset model database
 * 
 * ref: http://sailsjs.com/documentation/reference/web-sockets/resourceful-pub-sub
 * 
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {addTrackJson.indexAnonym$8}
 */
function syncDatasets() {
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
                        // todo: better error handling
                        return sails.log(i,'failed to create (it may exists)');
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
                        return ('dataset delete failed',err);
                    }
                    Dataset.publishDestroy(modelItems[j]);
                });
            }
        }
        
    });
}
