/**
 * @module
 *
 * @description TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var path = require('path');
var deferred = require('deferred');
var deepmerge = require('deepmerge');

module.exports = {

    attributes: {
        dataset: {
            model: 'dataset',
            required: true
        },
        dataSetPath: {
            type: 'string',
            required: true
        },
        lkey: {
            type: 'string',
            required: true
        }

    },
    startMonitor: function() {
        sails.log.info("Track Monitor Starting");

        var thisB = this;
        
        //setTimeout(function(){
        //    thisB.syncTracks();
        //},1000);
    },
    syncTracks: function(dataSet) {
        syncTracks(dataSet);
    },
    saveTracks: function(dataSet) {
        saveTracks(dataSet);
    }
};
/**
 * Save model tracks to trackList.json
 * @param {type} dataSet, if dataset is not defined, all models are committed.
 * @returns {undefined}
 */
function saveTracks(dataSet) {
    
    var g = sails.config.globals.jbrowse;
    var trackListPath = g.jbrowsePath + g.dataSetPath + '/' + 'trackList.json';
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
}
/**
 * Sync tracklist.json tracks with Track model (promises version)
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {addTrackJson.indexAnonym$8}
 */
function syncTracks(dataSet) {
    var g = sails.config.globals.jbrowse;
    //var Track = sails.models.track;
    
    // todo: handle trackList.json open error / not found
    var trackListPath = g.jbrowsePath + dataSet.path + '/' + 'trackList.json';
    //var dataSetPath = dataSet.path;
    sails.log.debug('syncTracks()');
    var mTracks = {};
    var fTracks = {};

    Track.find({dataSetPath:dataSet.path})
        .then(function(modelTracks) {
            sails.log.debug("modelTracks",modelTracks.length);

            for(var i in modelTracks)
              mTracks[modelTracks[i].lkey] = modelTracks[i];

            // read file tracks
            return fs.readFileAsync(trackListPath);
        })
        .then(function(trackListData) {
            var fileTracks = JSON.parse(trackListData).tracks;

            sails.log.debug('fileTracks',fileTracks.length);

            for(var i in fileTracks)
              fTracks[fileTracks[i].label] = fileTracks[i];

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
          sails.log.debug("ids to delete",toDel);
          Track.destroy({id: toDel})
            .then(function(deleted){
              sails.log.debug("tracks deleted:",deleted.length);
              Track.publishDestroy(deleted);
            })
            .catch(function(err) {
                sails.log.error("tracks delete failed:",toDel);
            });
        }
    };
    function addOrUpdateItemsToModel(mTracks,fTracks) {
        // add or update file items to model
        var createList = [];
        var updateList = [];
        for(var k in fTracks) {
          //sails.log('fTracks[i]',i,fTracks[i])
          if (typeof mTracks[k] === 'undefined') {
                var data = {
                    dataset: dataSet.id,
                    dataSetPath: dataSet.path,
                    lkey: fTracks[k].label,
                    trackData: fTracks[k]
                };
                
                //data = deepmerge(data,fTracks[k]);
                
                Track.create(data)
                .then(function(item) {
                    sails.log.debug("track created:",item.id,item.lkey);
                    Track.publishCreate(item);
                })        
                .catch(function(err) {
                    sails.log.error("track create failed",err);
                });
          }
          // update model if they are different
          else {
              var toOmit = ['id','createdAt','updatedAt','dataSet','dataset','dataSetPath','ikey'];
              //sails.log('omit',mTracks[k].trackData);
              if (JSON.stringify(mTracks[k].trackData) !== JSON.stringify(fTracks[k])) {
                  //update model record
                  //var data = {
                  //  dataset: dataSet.id,
                  //  dataSetPath: dataSet.path,
                  //  lkey: fTracks[k].label
                  //};
                  
                  data = deepmerge(data,fTracks[k]);
                  
                  Track.update({dataSetPath:dataSet.path, lkey:fTracks[k].label},{trackData:fTracks[k]})
                  .then(function(item) {
                      sails.log.debug("track updated:",item[0].id,item[0].lkey);
                      Track.publishUpdate(item);
                  })        
                  .catch(function(err) {
                      sails.log.error("track update failed:",err);
                  });
              }
          }
        }
    };
    
}


