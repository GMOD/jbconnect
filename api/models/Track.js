/**
 * @module
 * @description
 * Track is a model for a list of tracks that are in the ``trackList.json``'s ``[tracks]`` section.
 * 
 * Ref: `Sails Models and ORM <http://sailsjs.org/documentation/concepts/models-and-orm/models>`_
 * 
 * Track object example:
 * ::
 *   {
 *     "dataset": 1,
 *     "path": "sample_data/json/volvox",
 *     "lkey": "DNA",
 *     "trackData": {
 *       "seqType": "dna",
 *       "key": "Reference sequence",
 *       "storeClass": "JBrowse/Store/Sequence/StaticChunked",
 *       "chunkSize": 20000,
 *       "urlTemplate": "seq/{refseq_dirpath}/{refseq}-",
 *       "label": "DNA",
 *       "type": "SequenceTrack",
 *       "category": "Reference sequence"
 *     },
 *     "createdAt": "2018-02-01T05:38:26.339Z",
 *     "updatedAt": "2018-02-01T05:38:26.339Z",
 *     "id": 1
 *   } 
 * 
 */

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const path = require('path');
const deferred = require('deferred');
const deepmerge = require('deepmerge');
const _ = require('lodash');

module.exports = {

    attributes: {
        dataset: {
            model: 'dataset',
            required: true,
            via: 'path'
        },
        path: {
            type: 'string',
            required: true
        },
        lkey: {     // lkey is the tracklabel|<dataset index>  i.e. "sample_data/json/volvox|1"
            type: 'string',
            required: true,
            unique: true
        }

    },
    /**
     * 
     * @param {type} params - parameters
     * @param {type} cb - callback function
     */
    Init: function(params,cb) {
        //Track.startWatch();
        return cb();
    },
    /*
     * Start watching trackList.json
     */
    StartWatch: function() {
        sails.log.info("Starting track watch");
        // this is wiring for the track watch - which will monitor trackList.json for changes.
        // presumably when we modify the file, we have to turn off watching so as not to trigger a circular event disaster.
        // npm watch
    },
    
    /*
     * Pause trackList.json watching
     * This is used by internal operations that change trackList.json
     * When the internal operation is complete, resumeWatch should be called.
     * 
     * @param {string} dataset
     * @returns {undefined}
     */
    
    PauseWatch: function(dataset) {
        
    },
    
    /*
     * Resume watching trackList.json
     * 
     * @param {string} dataset
     * @returns {undefined}
     */
    
    ResumeWatch: function(dataset) {
        
    },
    
    /**
     * Get list of tracks based on critera in params
     *   
     * @param {object} params - search critera
     * @param {function} cb - callback ``function(err,array)``
     * 
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           cb(null,foundList) 
        }).catch(function(err){
           cb(err);
        });
    },
    /*
     * Add a track. into trackList.json and db.
     * addTrack.dataset must be defined as either int ( of db dataset id) or string (dataset string ie. ref of data = "sample_data/json/volvox")
     * addTrack.label must be defined and unique
     * dataset must exist with a physical location.
     * 
     * @param {object} track - this is a object that is essentially a track in trackList.json
     * @returns {object} lkey (ie. {lkey:"xxxx"})
     */
    Add: function(addTrack,cb) {
        console.log("Add",addTrack);
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        if (_.isUndefined(addTrack.dataset)) return cb("dataset not defined");
        var ds = Dataset.Resolve(addTrack.dataset);
        var trackListPath = g.jbrowsePath + ds.path + '/' + 'trackList.json';

        // validate
        if (ds===null) return cb("dataset does not exist");
        if (typeof addTrack.label !== 'string') return cb("invalid track label",addTrack.label);
    
        Track.PauseWatch(ds.id);

        addTrack.dataset = ds.id;
        
        // save track to tracklist json
        try {
          var trackListData = fs.readFileSync (trackListPath);
          var config = JSON.parse(trackListData);
          config.tracks.push(addTrack);
          fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
        }
        catch(err) {
            sails.log.error("addTrack failed",addTrack.label,err);
            Track.ResumeWatch(ds.id);
            return cb(err);
        }

        // write to track db
        var data = {
            dataset: ds.id,
            path: ds.path,
            lkey: addTrack.label+"|"+ds.id,
            trackData: addTrack
        };

        Track.create(data)
        .then(function(created) {
            sails.log.debug("Track.Add created:",created.id,created.lkey);
            
            Track.publishCreate(created);       // announce
            Track.ResumeWatch(ds.id);
            
            return cb(null,created);
        })        
        .catch(function(err) {
            sails.log.error("addTrack track create failed",err);
            Track.ResumeWatch(ds.id);
            return cb(err);
        });
        
    },
    /*
     * 
     * @param {string} dataset - (eg: "sample_data/json/volvlx")
     * @param {string} dataset - dataset string (i.e. "sample_data/json/volvox"
     * @returns {object} track db element
     */
    Modify: function(dataset,updateTrack,cb) {
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        var dataSet = Dataset.Resolve(dataset);
        var trackListPath = g.jbrowsePath + dataSet.path + '/trackList.json';

        Track.PauseWatch(dataSet.id);
        
        // save track to tracklist json
        try {
          var trackListData = fs.readFileSync (trackListPath);
          var config = JSON.parse(trackListData);
          thisb._updateTrack(config.tracks,updateTrack);
          fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
        }
        catch(err) {
            sails.log.error("modifyTrack failed",updateTrack.label,err);
            Track.ResumeWatch(dataSet.id);
            return cb(err);
        }

        Track.update({lkey:updateTrack.label,path:dataSet.path},{trackData:updateTrack})
        .then(function(updated) {
            sails.log.debug("modifyTrack track update:",updated[0].id,updated[0].lkey);
            
            Track.publishUpdate(updated[0].id,updated[0]);       // announce
            Track.ResumeWatch(dataSet.id);
            
            return cb(null,updated[0]);
        })        
        .catch(function(err) {
            sails.log.error("modifyTrack update failed",err);
            Track.ResumeWatch(dataSet.id);
            return cb(err);
        });
    },
    /**
     * 
     * @param {string} dataset - (eg: "sample_data/json/volvlx")
     * @param {ing} dataset - dataset string (i.e. "sample_data/json/volvox"
     * @param (function) cb - callback function(err,
     */
    Remove: function(dataset,id,cb) {
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        var dataSet = Dataset.Resolve(dataset);

        Track.PauseWatch(dataSet.id);
        
        Track.findOne({id:id,path:dataSet.path}).then(function(found) {
            var key = found.lkey;
            // save track to tracklist json
            var trackListPath = g.jbrowsePath + dataSet.path + '/' + 'trackList.json';
            try {
              var trackListData = fs.readFileSync (trackListPath);
              var config = JSON.parse(trackListData);
              _removeTrack(config.tracks,key);
              fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
            }
            catch(err) {
                sails.log.error("removeTrack failed",trackListPath,err);
                Track.ResumeWatch(dataSet.id);
                return cb(err);
            }
            Track.destroy(id).then(function() {
                sails.log.debug("removeTrack track destroyed:",id,found.trackData.label);

                Track.publishDestroy(id);       // announce
                Track.ResumeWatch(dataSet.id);

                return cb(null,id);
            })        
            .catch(function(err) {
                sails.log.error("removeTrack destroy failed",id, err);
                Track.ResumeWatch(dataSet.id);
                return cb(err);
            });
            
        }).catch(function(err){
            sails.log.error("removeTrack error", id, err);
            Track.ResumeWatch(dataSet.id);
            return cb(err);
        });
    },
    /**
     * Sync tracklist.json tracks with Track model (promises version)
     * 
     * todo: dataSet should accept string or dataSet object id
     * 
     * @param {string} ds, if dataset is not defined, all models are committed.
     * 
     */
    
    Sync: function(ds) {
        var g = sails.config.globals.jbrowse;

        //console.log("Track.sync dataset",ds);

        // todo: handle trackList.json open error / not found
        var trackListPath = g.jbrowsePath + ds + '/' + 'trackList.json';

        var mTracks = {};       // model db tracks
        var fTracks = {};       // file (trackList.json) tracks

        Track.find({path:ds})
            .then(function(modelTracks) {
                //sails.log.debug("syncTracks modelTracks",modelTracks.length);

                for(var i in modelTracks)
                  mTracks[modelTracks[i].lkey] = modelTracks[i];

                //mtracks = mTracks;  // debug

                // read file tracks
                return fs.readFileAsync(trackListPath);
            })
            .then(function(trackListData) {
                var fileTracks = JSON.parse(trackListData).tracks;

                //sails.log.debug('syncTracks fileTracks',fileTracks.length);

                for(var i in fileTracks)
                  fTracks[fileTracks[i].label] = fileTracks[i];

                //ftracks = fTracks;

                deleteModelItems(mTracks,fTracks);
                addOrUpdateItemsToModel(mTracks,fTracks);            
            })    
            .catch(function(err) {
                sails.log.error(err);
            });

        function deleteModelItems(mTracks,fTracks) {
            var toDel = [];
            for(var k in mTracks) {
                if (typeof fTracks[k] === 'undefined')
                    toDel.push(mTracks[k].id);
            }
            if (toDel.length) {
              sails.log.debug("syncTracks ids to delete",toDel);
              Track.destroy({id: toDel})
                .then(function(deleted){
                  sails.log.debug("syncTracks tracks deleted:",deleted.length);
                  toDel.forEach(function(id) {
                      Track.publishDestroy(id);
                  });
                })
                .catch(function(err) {
                    sails.log.error("syncTracks tracks delete failed:",toDel);
                });
            }
        };
        function addOrUpdateItemsToModel(mTracks,fTracks) {
            // add or update file items to model
            for(var k in fTracks) {

              if (typeof mTracks[k] === 'undefined') {
                    var dataset = Dataset.Resolve(ds);
                    var data = {
                        dataset: dataset.id,
                        path: dataset.path,
                        lkey: fTracks[k].label,
                        trackData: fTracks[k]
                    };

                    //data = deepmerge(data,fTracks[k]);
                    //sails.log('track',k,data);
                    Track.create(data)
                    .then(function(item) {
                        sails.log.debug("syncTracks track created:",item.id,item.lkey);
                        Track.publishCreate(item);
                    })        
                    .catch(function(err) {
                        sails.log.error("syncTracks track create failed",err);
                    });
              }
              // update model if they are different
              else {
                  var toOmit = ['id','createdAt','updatedAt','dataSet','dataset','dataSetPath','ikey'];
                  //sails.log('omit',mTracks[k].trackData);
                  if (JSON.stringify(mTracks[k].trackData) !== JSON.stringify(fTracks[k])) {
                      Track.update({path:ds, lkey:fTracks[k].label},{trackData:fTracks[k]})
                      .then(function(item) {
                          /* istanbul ignore else */
                          if (item.length) {
                            Track.publishUpdate(item[0].id,item[0]);
                          }
                          else {
                              sails.log.error("syncTracks addOrUpdateItemsToModel failed to find", ds, fTracks[k].label);
                          }
                      })        
                      .catch(function(err) {
                          sails.log.error("syncTracks  addOrUpdateItemsToModel track update failed:",err);
                      });
                  }
              }
            }
        }
    },
    
    /*
     * Save model tracks to trackList.json (obsolete?)
     * 
     * todo: dataSet should accept string or dataSet object id
     * 
     * @param {string} dataSet, if dataset is not defined, all models are committed.
     */
    /*
    Save(dataSet) {
        var g = sails.config.globals.jbrowse;
        var trackListPath = g.jbrowsePath + dataSet.dataPath + '/' + 'trackList.json';
        //var dataSet = g.dataSet[0].dataPath;
        sails.log.debug('saveTracks('+dataSet+')');

        Track.find({dataSetPath:dataSet.path}).exec(function (err, modelTracks){
          if (err) {
            sails.log.error('modelTracks, failed to read');
            return;   // failed
          }
          sails.log.debug("modelTracks",modelTracks.length);

          var tracks = [];
          for(var k in modelTracks)
              tracks.push(modelTracks[k].trackData);

          // read trackList.json, modify, and write
          try {
            var trackListData = fs.readFileSync (trackListPath);
            var config = JSON.parse(trackListData);
            config['tracks'] = tracks;
            fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
          }
          catch(err) {
              sails.log.error("failed",trackListPath,err);
          }
        });
    },
    */
    
    //Given tracks array, find and update the item with the given updateTrack.
    //updateTrack must contain label.
    /*
    _modifyTrack: function(tracks,updateTrack){
        for(var i in tracks) {
            if (tracks[i].label === updateTrack.label) {
                tracks[i] = updateTrack;
                return true;    // success
            }
        }
        return false;   // not found
    },
    // Given tracks array, remove the item with the given key (which is track label)
    _removeTrack: function(tracks,key){
        for(var i in tracks) {
            if (tracks[i].label === key) {
                delete tracks[i];
                return true;    // success
            }
        }
        return false;   // not found
    }
    */
};



