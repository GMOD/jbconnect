/**
 * @module hooks/jbcore
 * @description
 * publish globals in a well known location
 */
var fs = require("fs-extra");

//var kueJobMon = require('./kueJobMon');


/* 
 * launches redis however it must first be installed with 'yum install redis'
 */
/*
var RedisServer = require('redis-server');
var redisPort = 6379;
var redisServerInstance = new RedisServer(redisPort);


redisServerInstance.open(function (error) {
 
  if (error) {
    throw new Error(error);
  }
  
  console.log('redis server, port '+redisPort);
 
});
*/
module.exports = function (sails) {
    var mySails = sails; 
    
    return {

        configure: function() {
            //sails.log("jbcore configure");
            //if (typeof sails.config.globals.jbrowse !== 'undefined') sails.log("globals.jbrowse exist");
            //if (typeof sails.config.globals.jbhooks === 'undefined') sails.config.globals.jbhooks = [];
            //sails.config.globals.jbhooks.splice(0, 0, "jbcore");
            
            //JbUtils.testFunction("called from jbcore.configure()");
        },
        initialize: function(cb) {
            sails.log("Hook: jbcore initialize"); 

            sails.on('hook:orm:loaded', function() {
            //sails.on('lifted', function() {
                sails.log(">>> jbcore sails lifted");
                
                setTimeout(function() {
                    Service.Init({},function() {

                        Dataset.Init({},function(){
                            Track.Init({}, function() {
                                
                            });
                        });
                        Job.Init({},function() {
                            //sails.log("Job.start done");
                            //return cb();
                        });

                    });
                },1000);

                // Inject css/js into the active JBrowse index.html
                var config = sails.config.globals.jbrowse;
                //console.log("config",config);
                jbutillib.exec_setupindex(config);
                jbutillib.exec_setupPlugins(config);                
                return cb();
                
            });
            
            //return cb();
        },
        routes: {
            before: {
                /**
                 * get /jb/globals
                 * returns globals from config/globals.js
                 */
                'get /jb/globals.js': function (req, res, next) {
                    res.send(sails.config.globals.jbrowse);
                    //return next();
                },
                /**
                 *  get /jb/hooks
                 *  returns list of hooks
                 */
                'get /jb/hooks': function (req, res, next) {
                    var hlist = [];
                    for (var hook in sails.hooks) {
                        //console.log('hook:',hook);
                        hlist.push(hook);
                    }
                    res.send(hlist);
                    //return next();
                },
                'get /test/setg': function (req, res, next) {
                    sails.hooks['jbcore'].setGlobalSection({a:1,b:2},'jblast',function(val) {
                        if (val==0) res.send({result:'success'});
                        else        res.send({result:'fail'});
                    });
                }
            }
        },
        /**
         * 
         */
        /*
        setGlobalSection: function(data,name,cb) {
            return storeInSection(data,name,cb);
        },
        */
        /*
         * intercept res.send for debugging
         * @param {type} res
         * @param {type} data
         * @returns {unresolved}
         */
        resSend(res,data) {
            sails.log.debug("******** resSend",data);
            return res.send(data);
        },
        /**
         * 
         * @param {type} eventName
         * @param {type} data
         * @returns {undefined}
         */
        sendEvent: function(eventName,data) {
            //Test.message(1, {message:eventName,data:data});
            //sails.log.debug("*** sendEvent: %s",eventName);
            sails.sockets.blast(eventName, data);
        }
    }
};

/**
 * Stores globals found in config/globals.js into the global JbGlobal model
 * @returns {undefined}
 */
/*
function storeGlobals () {
    
    var gStr = JSON.stringify(sails.config.globals.jbrowse,null,4);

    JbGlobal.findOne({'id':1}).exec(function (err, record) {
        if (err){
            console.log(err);
            return;
        }
        if (!record) {  // does not exist, create
            JbGlobal.create({'id':1,'jbrowse':sails.config.globals.jbrowse})
            .exec(function afterwards(err, updated){
                if (err) {
                  console.log(err);
                  return;
                }
            });
            console.log("JbGlobal created");
        }
        else {      // exists update
            JbGlobal.update({'id':1},{'id':1,'jbrowse':sails.config.globals.jbrowse})
            .exec(function afterwards(err, updated){
                if (err) {
                  console.log(err);
                  return;
                }
                sails.log.info("JbGlobal model updated from globals.js");
            });
        }
    });
    
}
*/
/**
 * Store section data in globals 
 * @param {type} sectionData
 * @param {type} sectionName
 * @returns 0 if successful; 1 if failed
 */
/*
function storeInSection (data,name,cb) {

    JbGlobal.findOne({'id':1}).exec(function (err, record) {
        if (err){
            console.log(err);
            throw err;
            if (typeof cb === 'function') cb(1);
        }
        else if (!record) {  // does not exist, create
            var err = 'error: global record doesn\'t exist';
            console.log(err);
            throw err;
            if (typeof cb === 'function') cb(1);
        }
        else {      // exists update
            
            //console.log('found',record,data,name);
            
            var g = record.jbrowse;
            
            // merge existing jblast section with new section data
            if (typeof g[name] === 'undefined') g[name] = {};
            for (var i in data) g[name][i] = data[i];
 
            //console.log('modified record',record);
            
            // update global model
            JbGlobal.update({'id':1},record)
            .exec(function afterwards(err, updated){
                if (err) {
                  console.log(err);
                  throw err;
                  if (typeof cb === 'function') cb(1);
                  return;
                }
                if (updated) {
                  //console.log("updated record",record);
                  console.log("globals updated");
                  if (typeof cb === 'function') cb(0);
                  return;
                }
                if (typeof cb === 'function') cb(1);
                return;
            });
        }
    });
    return 0; // success

}
*/
