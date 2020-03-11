#!/usr/bin/env node

/*
    this extends jbutil
*/

const jblib = require('../api/services/jbutillib');
const fetch = require('node-fetch');

module.exports = {
    getOptions: function() {
        return [
            ['d' , 'dbreset'        , 'reset the database to default and clean kue db'],
            ['f' , 'force'          , '--dbreset without verifying'],
            ['a' , 'setadmin'       , 'set admin flag'],
            ['r' , 'removeall'      , 'remove JBConnect components from JBrowse'],
            [''  ,'pushplugins'     , 'link plugins into JBrowse dir'],
            [''  ,'coverage=PLUGIN' , 'used with --pushplugins to add coverage instrumentation'],
            [''  ,'buildwebpack'    , 'build jbrowse webpack'],
            [''  ,'settrackinc'     , 'push track includes to trackList.json for datasets']
        ];        
    },
    getHelpText: function() {
        return "\n"+
            //"./jbutil --setpassword <username>\n"+
            "./jbutil --setadmin <username> <true|false>\n"+
            "./jbutil --pushplugins --coverage=<plugin name> - instruments specified plugin\n";
        
    },
    process: function(opt,path,config) {
        //console.log("extended jbutil", opt,path);
        
        this.config = config;
        //util.init(config);
        
        if (!this.init(config)) {
            console.log("jbutil failed to initialize");
            return;
        }
        if (opt.options['dbreset']) {
            let force = opt.options['force'];
            // perform a test to see if JBConnect is running.
            fetch(config.jbrowseRest+'/jobactive/get')
                .then(res => res.json())
                .then(json => {
                   console.log("This command only works when JBConnect is not running."); 
                })                
                .catch(err => {
                    process_dbreset(force);
                });
        }

        if (opt.options['pushplugins']) {
            let plugin = opt.options['coverage'];
            if (plugin) jblib.injectPlugins(plugin);
            else jblib.injectPlugins();
        }

        if (opt.options['removeall']) {
            jblib.removeIncludesFromHtml();
            jblib.removePlugins();
            jblib.unsetupPlugins();
        }
        if (opt.options['buildwebpack']) {
            jblib.buildWebpack();
        }
        if (opt.options['settrackinc']) {
            jblib.inject_tracklist();
        }
    },
    init: function(config) {
        return 1; // successful init
    }
    
};

/**********************************************
 * process commands arguments - implementation
 **********************************************/

function process_dbreset(force) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var util = require('util');
    
    if (force) {
        jblib.install_database(1);
        jblib.zapRedis();
        setTimeout(function() {
            process.exit();
        },1000);
    }
    else {
        console.log('JBConnect database will be reset to default.  Type "YES" to confirm.');

        process.stdin.on('data', function (text) {
        if (text === 'YES\n') {
            jblib.install_database(1);
            jblib.zapRedis();
        }
        else {
            console.log('nothing done.');
        }
        setTimeout(function() {
            process.exit();
        },1000);
        });
    }
}
