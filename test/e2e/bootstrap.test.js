//var sails = require('sails');
const shell = require('shelljs');
const spork = require('spork');
const sleep = require('sleep-promise');
//spork(command, args, options);
const jblib = require('../../api/services/jbutillib');

let fmonitor = {};
let pid = 0;

before(function(client, done) {
    console.log("resetting database...");
    jblib.install_database(1);
    jblib.zapRedis(done);
    
    let lifted = false;
    console.log("Lifting SAILS...");
    fmonitor = spork('sails', ['lift'], {exit: true})
    .on('stdout', function(data) {
        if (data.indexOf('Active Job Monitor starting') >= 0) {
            console.log(">> lift complete detected");
            lifted = true;
        }
    });
    let t1 = setInterval(function(){
        if (lifted) {
            console.log('fmonitor', fmonitor.childData);
            pid = fmonitor.childData.pid;
            clearInterval(t1);
            done();
        }
    },500);
});

after(function(client,done) {
    console.log("Lowering SAILS...");
    if (pid) {
        shell.exec('kill '+pid);
    }
    done();
});

