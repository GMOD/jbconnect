/*
 * sails bootstrap for mocha
 * 
 *  "scripts": {
 *    "test": "mocha test/bootstrap/bootstrap.test.js...
 */

sails = require('sails');
const shell = require('shelljs');
const fs = require('fs-extra');


const tlib = require('../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const iServer = 'http://localhost:8888';    // istanbul server
const expect = chai.expect;
const assert = chai.assert;

//const jbutil = require('api/services/jbutillib');

before(function(browser,done) {
    console.log("Lifting SAILS...");

    this.timeout(60000);

    //jbutil.injectPlugins();

    console.log('******** check for Coverage',process.env.E2E_COVERAGE);

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
            //console.log(">>>post timeout",typeof done);
            done();
        },2000);
    });
});
after(function(browser,done) {
    console.log('after');

    browser.execute(function(data) {
        return window.__coverage__;
    },[], function(result) {
        //console.log("result from browser",result);
        fs.writeFileSync('.nyc_output/client.json',JSON.stringify(result,null,4));

        // var Report = require('istanbul').Report;
        // var report = Report.create('text');
        // var collector = new require('istanbul').Collector;
   
        // collector.add(result);
        // report.on('done', function () { console.log('done'); });
        // report.writeReport(collector);

        lowerSails();
    });

    function lowerSails() {
        console.log("Lowering SAILS...");
        sails.lower(function() {
            console.log("done lowering sails.");
                setTimeout(function() {
                    done();
                    shell.exec('pkill chrome');
                    process.exit(0);  // not sure why this is needed.
                },2000);
        });
    }
});
