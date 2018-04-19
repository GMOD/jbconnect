#!/usr/bin/env node
const jblib = require('../api/services/jbutillib');
const fetch = require('node-fetch');

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
            // perform a test to see if JBConnect is running.
            fetch(config.jbrowseRest+'/jobactive/get')
                .then(res => res.json())
                .then(json => {
                   console.log("This command only works when JBConnect is not running."); 
                })                
                .catch(err => {
                    process_dbreset();
                });
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

function process_dbreset(done) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var util = require('util');
    console.log('JBConnect database will be reset to default.  Type "YES" to confirm.');

    process.stdin.on('data', function (text) {
      if (text === 'YES\n') {
          jblib.install_database(1);
          jblib.zapRedis(done);
      }
      else {
          console.log('nothing done.');
      }
      setTimeout(function() {
          process.exit();
      },1000);
    });
}
