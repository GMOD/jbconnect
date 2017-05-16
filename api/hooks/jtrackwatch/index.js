/* 
 */
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var path = require('path');
var deferred = require('deferred');


module.exports = function trackWatchHook(sails) {
    return {

        initialize: function(cb) {
            sails.log.debug("Hook: trackwatch initialize");
            
            setTimeout(function(){
                syncTracks();
            },1000);
            
            return cb();
        },
        routes: {
            before: {
                // given a reference to the trackList.json, it begins tracking the file
                /*
                'get /jbtrack/watch': function (req, res, next) {
                    console.log("jb-trackwatch /jbtrack/watch called");
                    tracklist = req.param("trackList");
                    console.log("tracklist = "+tracklist);
                    //JbTrack.message(1, {msg:"track-test",value:"JBrowse test"});

                    res.send({result:"success"});
                    //return next();
                },
                */
                'post /jbtrack/addTrack': function (req, res, next) {
                    console.log("jb-trackwatch /jbtrack/addTrack called");
                    var result = addTrackJson(req,res,next);
                    res.send(result);
                    //return next();
                },
                'get /jbtrack/removeTrack': function (req, res, next) {
                    console.log("jb-trackwatch /jbtrack/removeTrack called");
                    tracklist = req.param("trackList");
                    console.log("tracklist = "+tracklist);
                    //JbTrack.message(1, {msg:"track-test",value:"JBrowse test"});

                    res.send({result:"success"});
                    //return next();
                },
                'get /jbtrack/test/:value': function (req, res, next) {
                    console.log("jb-trackwatch /jbtrack/test/[value] called");
                    //console.dir(req.params);
                    console.log("received value = "+req.params.value);
                    
                    sails.hooks['jbcore'].sendEvent("track-test",{value:req.params.value});
                    //JbTrack.publishCreate({msg:"track-test",value:req.params.value});
                    res.send({result:"success"});
                    //return next();
                },
                'get /jbtrack/test': function (req, res, next) {
                    console.log("jb-trackwatch /jbtrack/test called");
                    sails.hooks['jbcore'].sendEvent("track-test",{value:"JBrowse test"});

                    res.send({result:"success"});
                    //return next();
                },
                'get /jbtrack/removeall': function(req,res,next) {
                    console.log("jb-trackwatch /jbtrack/removeall called");
                    var g = sails.config.globals.jbrowse;
                    var trackListPath = g.jbrowsePath + g.dataSet[0].dataPath + 'trackList.json';

                    var dataSet = g.dataSet[0].dataPath;
                    JbTrack.destroy({dataSet:dataSet}).exec(function (err){
                      if (err) {
                        res.send({result:"failed"});
                        //return; //res.negotiate(err);
                      }
                      sails.log('success');
                      res.send({result:"success"});
                      //return; // res.ok();
                    });                    
                },
                'get /jbtracks/sync': function(req,res,next) {
                    sails.log.info(path.basename(__filename),"/jbtrack/sync");
                    syncTracks();
                },
                'get /jbtracks/save': function(req,res,next) {
                    sails.log.info(path.basename(__filename),"/jbtrack/save");
                }
            }
        },
        syncTracks: function() {
            syncTracks();
        },
        saveTracks: function(dataSet) {
            saveTracks(dataSet);
        }
    };
}

function startTracking(tracklist) {
}
/**
 * Save model tracks to trackList.json
 * @param {type} dataSet, if dataset is not defined, all models are committed.
 * @returns {undefined}
 */
function saveTracks(dataSet) {
    
    var g = sails.config.globals.jbrowse;
    var trackListPath = g.jbrowsePath + g.dataSet[0].dataPath + 'trackList.json';
    var dataSet = g.dataSet[0].dataPath;
    sails.log.debug('saveTracks('+dataSet+')');

    JbTrack.find({dataSet:dataSet}).exec(function (err, modelTracks){
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
 * Sync tracklist.json tracks with JbTrack model (promises version)
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {addTrackJson.indexAnonym$8}
 */
function syncTracks() {
    var g = sails.config.globals.jbrowse;
    
    // todo: handle trackList.json open error / not found
    var trackListPath = g.jbrowsePath + g.dataSet[0].dataPath + 'trackList.json';
    var dataSet = g.dataSet[0].dataPath;
    sails.log.debug('syncTracks()');
    var mTracks = {};
    var fTracks = {};

    var deleteModelItems = function(mTracks,fTracks) {
        var toDel = [];
        for(var k in mTracks) {
            if (typeof fTracks[k] === 'undefined')
                toDel.push(mTracks[k].id);
        }
        if (toDel.length) {
          sails.log.debug("ids to delete",toDel);
          JbTrack.destroy({dataSet:dataSet,id: toDel})
            .then(function(deleted){
              sails.log.debug("tracks deleted:",deleted.length);
            })
            .catch(function(err) {
                sails.log.error("tracks delete failed:",toDel);
            });
        }
    };
    var addOrUpdateItemsToModel = function(mTracks,fTracks) {
        // add or update file items to model
        var createList = [];
        var updateList = [];
        for(var k in fTracks) {
          //sails.log('fTracks[i]',i,fTracks[i])
          if (typeof mTracks[k] === 'undefined') {
                var data = {
                      dataSet: dataSet,
                      lkey: fTracks[k].label,
                      trackData: fTracks[k]
                };
                JbTrack.create(data)
                .then(function(item) {
                    sails.log.debug("track created:",item.id,item.lkey);
                })        
                .catch(function(err) {
                    sails.log.error("track create failed",err);
                });
          }
          // update model if they are different
          else {
              if (JSON.stringify(mTracks[k].trackData) != JSON.stringify(fTracks[k])) {
                  //update model record
                  JbTrack.update({dataSet:dataSet,lkey:k},{trackData:fTracks[k]})
                  .then(function(item) {
                      sails.log.debug("track updated:",item[0].id,item[0].lkey);
                  })        
                  .catch(function(err) {
                      sails.log.error("track update failed:",err);
                  });
              }
          }
        }
        
    };

    JbTrack.find({dataSet:dataSet})
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
    
}
function syncTracks2() {
    
    var g = sails.config.globals.jbrowse;
    var trackListPath = g.jbrowsePath + g.dataSet[0].dataPath + 'trackList.json';
    var dataSet = g.dataSet[0].dataPath;
    sails.log.debug('syncTracks()');

    JbTrack.find({dataSet:dataSet}).exec(function (err, modelTracks){
      if (err) {
        sails.log.error('modelTracks, failed to read');
        return;   // failed
      }
      sails.log.debug("modelTracks",modelTracks.length);
      //if (modelTracks.length === 0) return;
      
      var mTracks = {};
      for(var i in modelTracks)
        mTracks[modelTracks[i].lkey] = modelTracks[i];
      
      // read file tracks
      var trackListData = fs.readFileSync (trackListPath);
      var fileTracks = JSON.parse(trackListData).tracks;
      
      sails.log.debug('fileTracks',fileTracks.length);
      
      var fTracks = {};
      for(var i in fileTracks)
        fTracks[fileTracks[i].label] = fileTracks[i];

      // delete model items that don't exist in file
      var toDel = [];
      for(var k in mTracks) {
          if (typeof fTracks[k] === 'undefined')
              toDel.push(mTracks[k].id);
      }
      
      if (toDel.length) {
        sails.log.debug("ids to delete",toDel);
        JbTrack.destroy({dataSet:dataSet,id: toDel}).exec(function (err){
          if (err) {
              sails.log.error("tracks delete failed:",toDel);
          }
          else
            sails.log.debug("tracks deleted:",toDel);
        });
      }
      
      //sails.log(fTracks);
      
      // add or update file items to model
      for(var k in fTracks) {
        //sails.log('fTracks[i]',i,fTracks[i])
        if (typeof mTracks[k] === 'undefined') {
            // create model record
            JbTrack.create({
                    dataSet: dataSet,
                    lkey: fTracks[k].label,
                    trackData: fTracks[k]
            }).exec(function (err, item){
              if (err) {
                sails.log.error('track create failed:',item.id,item.lkey);
              }
              else {
                sails.log.debug('track created:',item.id,item.lkey);
              }
            });
        }
        // update model if they are different
        else {
            if (JSON.stringify(mTracks[k].trackData) != JSON.stringify(fTracks[k])) {
                //update model record
                JbTrack.update({dataSet:dataSet,lkey:k},{trackData:fTracks[k]}).exec(function afterwards(err, item){
                  if (err) {
                    sails.log.error("track update failed:",item[0].id,item[0].lkey);
                  }
                  else
                    sails.log.debug("track updated:",item[0].id,item[0].lkey);
                });
            }
        }
      }
      
      return 0;     // success
    });
}
/**
 * addTrackJson()
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {addTrackJson.indexAnonym$21}
 */
function addTrackJson(req,res,next) {

    var g = sails.config.globals.jbrowse;
    
    var newTrackJson = req.body.addTracks;
    //var trackListPath = req.body.trackListPath;

    //console.log('globals',g);
    
    //todo: make this configurable later
    var trackListPath = g.jbrowsePath + g.dataSet[0].dataPath + 'trackList.json';
    
    
    //console.log(req.body);
    console.log("trackListPath = "+trackListPath);
    console.log("newTrackJson = ",newTrackJson);
    //var trackListPath = req.body.trackListPath;
    
    var filePath = trackListPath;
    
    console.log("reading ...");
    fs.readFile (filePath, function (err, trackListData) {
        if (err) {
            console.log ("Warning: could not open '" + trackListPath + "': " + err);
            return;
        }
        
        var trackListJson = err ? {} : JSON.parse(trackListData);
        //trackListJson.tracks = trackListJson.tracks || [];
        
        console.log("read "+trackListJson.tracks.length + " tracks");

        //var timeout = setTimeout (function() {
        //    if (args.newTrackPath == '/dev/stdin')
        //        console.log ("[waiting for new track on stdin]")
        //}, 500)
        //fs.readFile (newTrackPath, function (err, newTrackData) {
            //clearTimeout (timeout)
            //if (err) throw err;

            //var newTrackJson = JSON.parse(newTrackData);

            // if it's a single definition, coerce to an array
            if (Object.prototype.toString.call(newTrackJson) !== '[object Array]') {
                newTrackJson = [ newTrackJson ];
            }
            else {
                console.log("is array");
            }

            // validate the new track JSON structures
            console.log("validating...");
            newTrackJson.forEach (function (track) {
                if (!track.label) {
                    console.log ("Invalid track JSON: missing a label element");
                    //process.exit (1)
                    //return {"result":"fail", "reason":"Invalid track JSON: missing a label element"};
                }
            });

            // insert/replace the tracks
            console.log("insert/replace...");
            var addedTracks = [], replacedTracks = [];
            
            console.log("start track count "+trackListJson.tracks.length);
            
            newTrackJson.forEach (function (newTrack) {
                var newTracks = [];
                trackListJson.tracks.forEach (function (oldTrack) {
                    if (oldTrack.label === newTrack.label) {
                        newTracks.push (newTrack);
                        replacedTracks.push (newTrack);
                        newTrack = {};
                    } else {
                        newTracks.push (oldTrack);
                    }
                });
                if (newTrack.label) {
                    newTracks.push (newTrack);
                    addedTracks.push (newTrack);
                    console.log("** newtrack **");
                }
                trackListJson.tracks = newTracks;
            });

            // write the new track list
            console.log("start track count "+trackListJson.tracks.length);
            console.log("writing new tracklist...");

            var trackListOutputData = JSON.stringify (trackListJson, null, 2);
            fs.writeFileSync (filePath, trackListOutputData);
 
            // publish notifications
            deferred.map (addedTracks, function (track) {
                sails.hooks['jbcore'].sendEvent("track-new",{"value":track});
                console.log ("Announced new track " + track.label);
            });
            deferred.map (replacedTracks, function (track) {
                sails.hooks['jbcore'].sendEvent("track-replace",{value:track});
                console.log ("Announced replacement track " + track.label);
            });
        //});
    });
    
    return {result:"success"};
}
/*
function removeTrack(args) {
    fs.readFile (trackListPath, function (err, trackListData) {
        if (err) {
            console.log ("Warning: could not open '" + trackListPath + "': " + err)
        }
        var trackListJson = err ? {} : JSON.parse(trackListData)
        trackListJson.tracks = trackListJson.tracks || []

        // delete the track
        function deleteFilter (oldTrack) {
            return trackLabels.some (function (trackLabel) { return oldTrack.label == trackLabel })
        }
        function negate (pred) { return function() { return !pred.apply(this,arguments) } }
        var deletedTracks = trackListJson.tracks.filter (deleteFilter)
        trackListJson.tracks = trackListJson.tracks.filter (negate (deleteFilter))

        function notFoundFilter (trackLabel) {
            return !deletedTracks.some (function (track) { return track.label == trackLabel })
        }
        if (trackLabels.some (notFoundFilter)) {
            console.log ("Warning: the following track labels were not found: " + trackLabels.filter(notFoundFilter).join())
        }

        // write the new track list
        var trackListOutputData = JSON.stringify (trackListJson, null, 2)
        if (opt.options.stdout) {
            process.stdout.write (trackListOutputData + "\n")
        } else {
            fs.writeFileSync (trackListPath, trackListOutputData)
        }

        // delete the track data
        if (deleteData)
            deletedTracks.forEach (function (track) {
                var trackDataDir = path.join (dataDir, 'tracks', track.label)
                if (fs.existsSync (trackDataDir)) {
                    console.log ("Removing " + trackDataDir)
                    exec ('rm -r ' + trackDataDir)
                }
            })

        // publish notification
        var publishUrl = opt.options['notify']
        if (publishUrl) {
            var client = new faye.Client (publishUrl)
            var secret = opt.options['secret']
            if (secret)
                client.addExtension({
                    outgoing: function(message, callback) {
                        message.ext = message.ext || {};
                        message.ext.password = secret;
                        callback(message);
                    }
                });
            if (logging)
                client.addExtension({
                    outgoing: function(message, callback) {
                        console.log ('client outgoing', message);
                        callback(message);
                    }
                });
            client.publish ("/tracks/delete", trackLabels.map (function (trackLabel) {
                return { label : trackLabel }
            })).then (function() {
                console.log ("Announced deleted tracks: " + trackLabels.join())
                process.exit()
            }, function() {
                console.log ("Failed to announce deleted track " + trackLabels.join())
                process.exit()
            })

        } else {
            process.exit()
        }

    });
}
*/
