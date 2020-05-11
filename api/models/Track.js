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
        this.Sync(cb);
        //return cb();
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
    Get(params,cb) {
        let dataset = null;
        let user = null;
        if (params.dataset) dataset = params.dataset.split('?')[0];
        if (params.session || params.session.user || params.session.user.username) user = params.session.user.username;
        if (params.user) user = params.user;

        delete params.dataset;
        delete params.user;
        delete params.session;

        // number of parameters to match filter
        let match = 0;
        if (dataset) match++;
        if (user) match++;

          // we don't use this yet
        this.find(params).then(function(foundList) {
            cb(null,foundList);
            // let filteredList = [];

            // for (var i in foundList) {
            //     let track = foundList[i];
            //     let c = 0;
            //     if (dataset && track.path===dataset) c++;
            //     if (user && track.trackData.user === user) c++;

            //     if (c===match)  filteredList.push(track);
            // }
            // cb(null,filteredList) 
        }).catch(function(err){
            // istanbul ignore next
            cb(err);
        });
    },
    /**
     * Get JBrowse tracklist in JSON format of tracks based on critera in params
     *   
     * @param {object} params - search critera
     * @param {function} cb - callback ``function(err,json)``
     * 
     */
    GetTrackList(params,cb) {
        if (!params.session.authenticated) {
            cb(null,{});    // return nothing if not logged in
        }
        else { 
            if (!params.dataset) {
                cb('missing dataset parameter');
                return;
            }
            const dataset = params.dataset.split('?')[0];
            const g = sails.config.globals.jbrowse;
            const user = params.session.user.username;

            this.find({}).then(function(foundList) {
                let filteredList = { tracks:[] };

                for (var i in foundList) {
                    let track = foundList[i].trackData;
                    if (track.user === user && Dataset.Resolve(foundList[i].dataset).path===dataset) {
                    sails.log("track",track.key,'dataset',Dataset.Resolve(foundList[i].dataset).path);
                    track.urlTemplate = '../'+g.routePrefix+'/'+dataset+'/'+track.urlTemplate;
                        filteredList.tracks.push(track);
                    }
                }
                cb(null,filteredList) 
            }).catch(function(err){
                // istanbul ignore next
                cb(err);
            });
        }
    },    
    /*
     * Add a track. into jbconnect-tracks.json and db.
     * addTrack.dataset must be defined as either int ( of db dataset id) or string (dataset string ie. ref of data = "sample_data/json/volvox")
     * addTrack.label must be defined and unique
     * dataset must exist with a physical location.
     * 
     * @param {object} track - this is a object that is essentially a track in jbconnect-tracks.json
     * @returns {object} lkey (ie. {lkey:"xxxx"})
     */
    Add: function(addTrack,cb) {
        //console.log(">>>>> TrackAdd",addTrack);
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        if (_.isUndefined(addTrack.dataset)) return cb("dataset not defined");
        var ds = Dataset.Resolve(addTrack.dataset);
        var trackListPath = g.jbrowsePath + ds.path + '/' + g.trackListFile;

        // validate
        if (ds===null) return cb("dataset does not exist");
        if (typeof addTrack.label !== 'string') return cb("invalid track label",addTrack.label);
    
        Track.PauseWatch(ds.id);

        //addTrack.dataset = ds.id;
        delete addTrack.dataset;
        
        // save track to jbconnect-tracks.json
        try {
          var trackListData = fs.readFileSync (trackListPath);
          var config = JSON.parse(trackListData);
          config.tracks.push(addTrack);
          fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
        }
        catch(err) {
            // istanbul ignore true
            if (true) {
            sails.log.error("addTrack failed",addTrack.label,err);
            Track.ResumeWatch(ds.id);
            return cb(err);
            }
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

            let announceTrack = _.cloneDeep(created);
            announceTrack.datasetPath = ds.path;

            Track.publishCreate(announceTrack);       // announce
            Track.ResumeWatch(ds.id);
            
            return cb(null,created);
        })        
        .catch(function(err) {
            if (true) {
            sails.log.error("addTrack track create failed",err);
            Track.ResumeWatch(ds.id);
            return cb(err);
            }
        });
        
    },
    // dbAdd: function (addTrack,cb){
    //     // write to track db
    //     var data = {
    //         dataset: ds.id,
    //         path: ds.path,
    //         lkey: addTrack.label+"|"+ds.id,
    //         trackData: addTrack
    //     };

    //     Track.create(data)
    //     .then(function(created) {
    //         sails.log.debug("Track.Add created:",created.id,created.lkey);
            
    //         Track.publishCreate(created);       // announce
    //         Track.ResumeWatch(ds.id);
            
    //         return cb(null,created);
    //     })        
    //     .catch(function(err) {
    //         sails.log.error("addTrack track create failed",err);
    //         Track.ResumeWatch(ds.id);
    //         return cb(err);
    //     });

    // },
    // fAdd: function (addTrack,cb) {
    //     var g = sails.config.globals.jbrowse;
    //     var ds = Dataset.Resolve(addTrack.dataset);
    //     var trackListPath = g.jbrowsePath + ds.path + '/' + 'trackList.json';
    //     // save track to tracklist json
    //     try {
    //         var trackListData = fs.readFileSync (trackListPath);
    //         var config = JSON.parse(trackListData);
    //         config.tracks.push(addTrack);
    //         fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
    //     }
    //     catch(err) {
    //         sails.log.error("addTrack failed",addTrack.label,err);
    //         Track.ResumeWatch(ds.id);
    //         return cb(err);
    //     }
    // },
    /*
     * 
     * @param {string} dataset - (eg: "sample_data/json/volvlx")
     * @param {string} dataset - dataset string (i.e. "sample_data/json/volvox"
     * @returns {object} track db element
     */
    Modify: function(updateTrack,cb) {
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        var ds = Dataset.Resolve(updateTrack.dataset);
        var trackListPath = g.jbrowsePath + ds.path + '/'+g.trackListFile;

        Track.PauseWatch(ds.id);
        
        // save track to tracklist json
        try {
          var trackListData = fs.readFileSync (trackListPath);
          var config = JSON.parse(trackListData);
          _modifyTrack(config.tracks,updateTrack);
          fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
        }
        catch(err) {
            // istanbul ignore next
            if (true) {
            sails.log.error("modifyTrack failed",updateTrack.label,err);
            Track.ResumeWatch(ds.id);
            return cb(err);
            }
        }

        let lkey = updateTrack.label+"|"+ds.id;

        Track.update({lkey:lkey},{trackData:updateTrack})
        .then(function(updated) {
            sails.log.debug("modifyTrack track update:",updated[0].id,updated[0].lkey);
            
            Track.publishUpdate(0,updated[0]);       // announce
            Track.ResumeWatch(ds.id);
            
            return cb(null,updated[0]);
        })        
        .catch(function(err) {
            // istanbul ignore next
            if (true) {
                sails.log.error("modifyTrack update failed",err);
                Track.ResumeWatch(dataSet.id);
                return cb(err);
            }
        });
        //Given tracks array, find and update the item with the given updateTrack.
        //updateTrack must contain label.
        function _modifyTrack(tracks,updateTrack) {
            for(var i in tracks) {
                if (tracks[i].label === updateTrack.label) {
                    tracks[i] = updateTrack;
                    return true;    // success
                }
            }
            return false;   // not found
        }
        
    },
    /**
     * 
     * @param {string} dataset - (eg: "sample_data/json/volvox")
     * @param {int} id - id of the item to be removed
     * @param (function) cb - callback function(err,
     */
    Remove: function(params,cb) {
        var thisb = this;
        var g = sails.config.globals.jbrowse;
        if (_.isUndefined(params.dataset)) return cb("dataset not defined");
        if (_.isUndefined(params.id)) return cb("id not defined");
        let dataSet = Dataset.Resolve(params.dataset);
        let id = params.id;

        Track.PauseWatch(dataSet.id);
        
        Track.findOne({id:id,path:dataSet.path}).then(function(found) {
            var key = found.lkey;
            let label = found.trackData.label;

            sails.log.debug('Track.Remove',found.lkey);

            // save track to tracklist json
            
            var trackListPath = g.jbrowsePath + dataSet.path + '/' + g.trackListFile;
            try {
              var trackListData = fs.readFileSync (trackListPath);
              var config = JSON.parse(trackListData);
              if (_removeTrack(config.tracks,label)){
                fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
                console.log("track removed from file",label,trackListPath);
              }
            }
            catch(err) {
                // istanbul ignore next
                if (true) {
                    sails.log.error("removeTrack failed",trackListPath,err);
                    Track.ResumeWatch(dataSet.id);
                    return cb(err,dataSet.id);
                }
            }
            
            Track.destroy(id).then(function(destroyed) {
                sails.log.debug("track removed from db",id,found.trackData.label);

                Track.publishDestroy(id);       // announce
                Track.ResumeWatch(dataSet.id);

                return cb(null,id);
            })        
            .catch(function(err) {
                // istanbul ignore next
                if (true) {
                    sails.log.error("removeTrack destroy failed",id, err);
                    Track.ResumeWatch(dataSet.id);
                    return cb(err,dataSet.id);
                }
            });
            
        }).catch(function(err){
            // istanbul ignore next
            if (true) {
                sails.log.error("removeTrack error", id, err);
                Track.ResumeWatch(dataSet.id);
                return cb(err);
            }
        });
        // Given tracks array, remove the item with the given key (which is track label)
        function _removeTrack(tracks,key){
            for(var i in tracks) {
                if (tracks[i].label === key) {
                    tracks.splice(i,1);
                    //delete tracks[i];
                    return true;    // success
                }
            }
            // istanbul ignore next
            return false;   // not found
        }
    },
    /**
     * Sync tracklist.json tracks with Track model (promises version)
     * 
     * @param {string} dataset   ie. ("sample_data/json/volvox")
     * 
     */

    Sync: function(cb) {
        const g = sails.config.globals.jbrowse;
        const datasets = g.dataSet;

        (async () => {
            try {
                await Track.destroy({});
            }
            catch(err) {
                sails.log.error("faild to delete old tracks");
                cb(err);
            }

            for(var i in datasets) {

                let ds = Dataset.Resolve(datasets[i].path);
                let trackListPath = g.jbrowsePath + ds.path + '/'+g.trackListFile;

                // create if it doesn't exist
                if (!fs.existsSync(trackListPath))
                    fs.writeFileSync(trackListPath,JSON.stringify({tracks:[]}));

                let fTracks = JSON.parse(fs.readFileSync(trackListPath,"utf8")).tracks;

                for(var k in fTracks) {
                    let data = {
                        dataset: ds.id,
                        path: ds.path,
                        lkey: fTracks[k].label+'|'+ds.id,
                        trackData: fTracks[k]
                    };

                    try {
                        var created = await Track.create(data);
                        sails.log.info("track id",created.id,created.lkey,created.path,'('+created.trackData.user+')');
                    }
                    catch(err) {
                        sails.log.error("failed to create track:",err);
                        cb(err);
                    }
                }
            }
            cb();
        })();

    },
    SyncTest(cb) {
        setTimeout(function() {
            cb();
        },2000);
    },
    /**
     * remove all tracks for a given user.
     * if params.session does not exist or user not logged in, returns false.
     * @param {object} params 
     * @returns {int} returns true if successful, false if nothing done
     */
    async cleanTracks(params) {
        let user = User.GetUser(params);
        if (!user) return false;
        

    }
    
};



