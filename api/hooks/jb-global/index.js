/* 
 * publish globals in a well known location
 */
var fs = require("fs");

//var globalPath = "/etc/jbrowse";
//var globalFile = globalPath + "/globals.dat";

module.exports = function (sails) {
   var mySails = sails; 
   return {

        initialize: function(cb) {
            console.log("jb-global initialize"); 

            sails.on('hook:orm:loaded', function() {

                //console.log(JbGlobal,JbTrack);
                storeGlobals();
                return cb();

            });
            //JbTrack.message(1, {msg:"track-test",value:'hello'});
            //console.log("JbGlobal",JbTrack);
/*
            if (!fs.existsSync(globalPath)){
                fs.mkdir(globalPath, function(err) {
                    if (err)    throw err;
                    storeGlobals();
                });
            }
            else {
                storeGlobals();
            }
*/
           //return cb();
        },
        routes: {
            before: {
                // given a reference to the trackList.json, it begins tracking the file
                'get /jbglobal/test': function (req, res, next) {
                    console.log("jb-global /jbglobal/test called");
                    res.send({result:"success",'globals.js':sails.config.globals.jbrowse});
                    //return next();
                }
            }
        }

    }
};

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
            });
            console.log("JbGlobal updated");
        }
    });
    
    /*
    fs.writeFile(globalFile,gStr, function (err) {
        if (err) throw err;
        console.log("Global file: "+ globalFile);
    });
    */    
}


