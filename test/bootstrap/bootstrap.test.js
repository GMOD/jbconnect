/*
 * sails bootstrap for mocha
 * 
 *  "scripts": {
 *    "test": "mocha test/bootstrap/bootstrap.test.js...
 */

sails = require('sails');
const shell = require('shelljs');
const _ = require("lodash");

before(function(done) {
    console.log("Lifting SAILS...");

    this.timeout(60000);

    shell.exec('./jbutil --force --dbreset');

    let params = {

        // configuration for testing purposes
        // If you want to use a different DB for testing, uncomment these and replace with your own DB info.
        
        connections: {
          // Replace the following with whatever suits you.
            localDb: {
              adapter: 'sails-disk',
              filePath: 'test/data/'
            },
            testMysql: {
              adapter   : 'sails-mysql',
              host      : 'localhost',
              port      : 3306,
              user      : 'mySQLUser',
              password  : 'MyAwesomePassword',
              database  : 'testDB'
            }
        },

        models: {
          connection: 'localDb',
          migrate: 'drop'
        }
        ,
        policies: {
            '*': true
        }
            
    }; 
    
    params = {};
    
//    console.log("Using DB test/data/localDb.db");
    if (shell.cp('test/data/localDiskDb.db','test/data/localDb.db').code !== 0) {
      shell.echo('error copying test database');
      shell.exit(1);
    }
    sails.lift(params, function(err) {
        if (err) return done(err);

        // here you can load fixtures, etc.
        setTimeout(function() {
            console.log(">>>post timeout",typeof done);

            Track.find({}).then(function(records) {
                //console.log('xxxbootstrap records',records)
                if (err) {
                    console.log("bootstrap failed to get tracks",err);
                    return done();
                }
                if (_.isUndefined(records)) {
                    sails.log.error("Track.Get undefined records");
                    return done();
                }
                if (records.length > 0) {
                    sails.log.info("Removing test tracks with category JBConnectTest");
                    for(var i in records ) {
                        if ( !_.isUndefined(records[i].trackData.category) && records[i].trackData.category==='JBConnectTest' ) {
                            sails.log.info('removing id',records[i].id, records[i].lkey);
                            Track.Remove(records[i].dataset,records[i].id,function(err,id) {
                                if (err) {
                                    sails.log.error("failed to remove",id);
                                }
                            });
                        }
                    }
                }
                else {
                    console.log ("no nothing tracks to delete");
                }
                done();
            });
        },2000);
    });
});

after(function(done) {
    console.log("Lowering SAILS...");
    sails.lower(function() {
        console.log("done lowering sails.");
            setTimeout(function() {
                done();
                process.exit(0);  // not sure why this is needed.
            },2000);
    });
});
