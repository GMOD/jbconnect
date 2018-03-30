#!/usr/bin/env node

var jblib = require('../api/services/jbutillib');

module.exports = {
    getOptions: function() {
        return [
            ['d' , 'dbreset'        , 'reset the database to default and clean kue db'],
            ['p' , 'setpassword',   , 'change password of user'],
            ['a' , 'setadmin',      , 'set admin flag'],
            ['r' , 'removeall'      , 'remove JBConnect components from JBrowse']
        ];        
    },
    getHelpText: function() {
        return "\n"+
            "./jbutil --setpassword <username>\n"+
            "./jbutil --setadmin <username> <true|false\n";
        
    },
    process: function(opt,path,config) {
        //console.log("extended jbutil", opt,path);
        
        this.config = config;
        //util.init(config);
        
        if (!this.init(config)) {
            console.log("jbutil failed to initialize");
            return;
        }
        var tool = opt.options['dbreset'];
        if (typeof tool !== 'undefined') {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            var util = require('util');
            console.log('JBConnect database will be reset to default.  Type "YES" to confirm.');

            process.stdin.on('data', function (text) {
              if (text === 'YES\n') {
                  jblib.install_database(1);
              }
              else {
                  console.log('nothing done.');
              }
              done();
            });
            function done() {
              process.exit();
            }            
        }
        var tool = opt.options['password'];
        if (typeof tool !== 'undefined') {
            console.log('opt',opt);
        }
        var tool = opt.options['removeall'];
        if (typeof tool !== 'undefined') {
            jblib.removeIncludesFromHtml();
            jblib.removePlugins();
            jblib.unsetupPlugins();
        }
    },
    init: function(config) {
        return 1; // successful init
    }
    
};

/**********************************************
 * process commands arguments - implementation
 **********************************************/

function exec_cleankue(params) {
    kue.Job.rangeByType( 'workflow', 'failed', 0, 10000, 'asc', function( err, jobs ) {
        jobs.forEach( function( job ) {
            removejob(job);
        });
    });
    kue.Job.rangeByType( 'workflow', 'active', 0, 10000, 'asc', function( err, jobs ) {
        jobs.forEach( function( job ) {
            removejob(job);
        });
    });
    kue.Job.rangeByType( 'workflow', 'completed', 0, 10000, 'asc', function( err, jobs ) {
        jobs.forEach( function( job ) {
            removejob(job);
        });
    });
    
    function removejob(job) {
        job.remove( function(){
          console.log( 'removed ', job.id ,job.data.name);
        });
    }
}
