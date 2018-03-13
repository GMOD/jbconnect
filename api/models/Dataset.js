/**
 * @module
 * @description
 * Dataset is a model that represents the JBrowse dataset.  Generally, this includes
 * path to the dataset and some of the data contained in trackList.json.
 * 
 * Datasets known to JBConnect are defined in config/globals.js
 * (see: :ref:`jbs-globals-config`)
 * 
 * Dataset object:
 * ::
 *   {
 *     "name": "Volvox",
 *     "path": "sample_data/json/volvox",
 *     "createdAt": "2018-02-01T05:38:26.320Z",
 *     "updatedAt": "2018-02-01T05:38:26.320Z",
 *     "id": 1
 *   }
 *      
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 */

module.exports = {

    attributes: {
        name: {
            type: 'string',
        }, 
        path: {
            type: 'string',
            unique: true
        },
        tracks: {
            collection: 'track',
            via: 'id'
        }
    },
    /*
     * assoc array of datasets {path:"sample_data/json/volvox", id:1}
     */
    _dataSets: {},
    /**
     * Initializes datasets as defined in config/globals.js.
     * (see: :ref:`jbs-globals-config`)
     * @param {function} cb - callback function 
     * @returns {undefined}
     */
    Init: function(params,cb) {
        this.Sync(cb);
        
        // todo: need to handle this in callback
        //cb();
    },
    /**
     * Get list of tracks based on critera in params
     *   
     * @param {object} params - search critera (i.e. ``{id: 1,user:'jimmy'}`` )
     * @param {function} cb - callback ``function(err,array)``
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    /**
     * Given either a dataset string (ie. "sample_data/json/volvox" or the database id of a dataset,
     * it returns a dataset object in the form:
     * 
     * ::
     *     
     *     {
     *         path: "sample_data/json/volvox",
     *         id: 3
     *     }
     *
     * 
     * @param {val} dval - dataset string (ie. "sample_data/json/volvox") or id (int)
     * 
     *      
     * Code Example
     * ::
     *     {
     *         path: "sample_data/json/volvox",
     *         id: 3
     *     }
     *     
     * @returns {object} - dataset object
     *      dataset (string - i.e. "sample_data/json/volvox" if input was an id
     *      
     */
    Resolve: function(dval){
        if (typeof this._dataSets[dval] !== 'undefined')
            return this._dataSets[dval];
        sails.log.error('Dataset.resolve not found (we shouldnt get here',dval);
        return null;
    },
    /**
     * Sync datasets, defined in globals with database.
     * 
     * todo: need to improve, perhaps use async?
     * 
     * @param (function) cb - callback function
     */
    Sync:function(cb) {
        sails.log.debug('syncDatasets()');
        var g = sails.config.globals.jbrowse;
        var thisb = this;

        // this will be an assoc array referenced by dataset id and path
        //g.datasets = {};

        // these will be associative arrays
        var modelItems = {};                    // Dataset db items
        //sails.log('g.dataSet',g.dataSet);

        // convert to assoc array in confItems
        for(var i in g.dataSet) {
            thisb._dataSets[g.dataSet[i].path] = g.dataSet[i];
            thisb._dataSets[g.dataSet[i].path].name = i;
        }

        Dataset.find({}, function(err,mItems) {
            if (err) {
                cb(err);
                return;
            }
            // convert to assoc array in modelItems
            for( var i in mItems) modelItems[mItems[i].path] = mItems[i];

            async.each(thisb._dataSets,function(item,cb1) {
                //console.log('item',item,modelItems);
                if (typeof modelItems[item.path] !== 'undefined') {     

                    thisb._dataSets[item.path].id = modelItems[item.path].id
                    thisb._dataSets[item.id] = thisb._dataSets[item.path]

                    Track.Sync(item.path);
                    
                    return cb1();
                }
                // dataset is confItems, not in model Items --> add dataset to db
                else {
                    var data = {
                        name: item.name,
                        path: item.path
                    }
                    Dataset.create(data,function(err, newDataset) {
                        if (err) {
                            var msg = 'failed to create dataset (it may exists) = path '+i;
                            return cb1(err);
                        }

                        data.id = newDataset.id;
                        
                        // create two refs
                        thisb._dataSets[data.id] = data;
                        thisb._dataSets[data.path] = data;

                        sails.log("Dataset.create",data);

                        Track.Sync(data.path);

                        Dataset.publishCreate(newDataset);
                        
                        return cb1();
                    });
                }
            },function asyncEachDone(err) {
                if (err) {
                    sails.log.error("asyncEachDone failed",err);
                    return cb(err);
                }
                deleteItems();
                return cb();
            });
            
            // delete datasets if they dont exist in config
            function deleteItems() {
                async.each(modelItems,function(item, cb) {
                    if (typeof thisb._dataSets[item.path] === 'undefined') {
                        //sails.log('deleting dataset',j);

                        Dataset.destroy(item.id,function(err) {
                            if (err) {
                                sails.log.error('Dataset.destroy failed - id=',item.id);
                                return cb(err);
                            }
                            sails.log("Dataset.destroy",item.id);
                            // notify listeners
                            Dataset.publishDestroy(item.id);   // announce
                            return cb();
                        });
                    }
                }, function(err) {
                    if (err) {
                        sails.log.error("deleteItems failed");
                        //return cb(err);
                    }
                    //return cb();
                });
            }
        });
    }
};

