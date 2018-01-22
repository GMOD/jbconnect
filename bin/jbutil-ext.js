#!/usr/bin/env node

var jblib = require('../api/services/jbutillib');

module.exports = {
    getOptions: function() {
        return [
            //['' , 'setupindex'       , '(JBServer) setup index.html and plugins']
            ['' , 'dbreset'     , '(JBServer) reset the database to default'],
            ['' , 'password',   , '(JBServer) change password of user']
        ];        
    },
    getHelpText: function() {
        return "";
        
    },
    process: function(opt,path,config) {
        //console.log("extended jbutil", opt,path);
        
        this.config = config;
        //util.init(config);
        
        if (!this.init(config)) {
            console.log("jbutil failed to initialize");
            return;
        }
        
        var tool = opt.options['setupindex'];
        if (typeof tool !== 'undefined') {
            jblib.exec_setupindex(this.config);
            jblib.exec_setupPlugins(this.config);
        }
        
        var tool = opt.options['dbreset'];
        if (typeof tool !== 'undefined') {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            var util = require('util');
            console.log('JBServer database will be reset to default.  Type "YES" to confirm.');

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
    },
    init: function(config) {
        //console.log("config",config);
        /*
         * get values for --gpath, apikey and gurl; grab from saved globals if necessary
         */
        this.gurl = config.galaxy.galaxyUrl;
        this.gpath = config.galaxy.galaxyPath;
        this.apikey = config.galaxy.galaxyAPIKey;
        return 1; // successful init
    }
    
};

/**********************************************
 * process commands arguments - implementation
 **********************************************/

