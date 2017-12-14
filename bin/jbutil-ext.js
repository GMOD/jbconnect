#!/usr/bin/env node

//var requestp = require('request-promise');
var fs = require('fs-extra');
var path = require('path');
var approot = require('app-root-path'); 

module.exports = {
    getOptions: function() {
        return [
            ['' , 'setupindex'       , '(ServerSearch) setup index.html in the jbrowse directory']
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
            exec_setupindex(this);
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

/**
 * 
 * @param {type} params 
 * @returns {undefined}
 */
function exec_setupindex(params) {
    var g = params.config;

    var content = global.buildHtml();
    
    var srcpath = path.normalize(approot+"/bin");
    console.log("processing --setupindex");
    console.log(srcpath+'/index.html',g.jbrowsePath+'index.html');
    
    //var bakfile = safeCopy(srcpath+'/index.html',g.jbrowsePath+'/index.html');
    var bakfile = safeWriteFile(content,g.jbrowsePath+'/index.html');
    if (bakfile)
        console.log('a backup of jbrowse/index.html was made in', bakfile);
    else
        console.log('index.html content unchanged.');
}
/**
 * copy src to targ, but if targ exists, it will backup the target by appending a number
 * @param {string} src source
 * @param {string} targ target
 * @returns {string} final target filename, 
 */
function safeCopy(src,origTarg) {

    var newTarg = origTarg;
    var index = 0;
    var backup = false;

    while(fs.pathExistsSync(newTarg)) {
        backup = true;
        // create new target name (inc)
        index++;
        newTarg = path.dirname(origTarg) + path.basename(origTarg, '.html') + index + '.html';
        //console.log("trying new",newTarg);
    }
    // make backup of origTarg
    if (backup)
        fs.copySync(origTarg,newTarg);

    // copy ssource to origTarg
    fs.copySync(src,origTarg);

    if (origTarg===newTarg) return null;
    return newTarg;
}
function safeWriteFile(content,origTarg) {
    
    var newTarg = origTarg;
    var index = 0;
    var backup = false;

    // if new content is same as old content, abandon write
    var origContent = fs.readFileSync(origTarg,'utf-8');
    if (origContent === content) {
        return 0;   // content is the same, skip
    }

    while(fs.pathExistsSync(newTarg)) {
        backup = true;
        
        // create new target name (inc)
        index++;
        newTarg = path.dirname(origTarg) + path.basename(origTarg, '.html') + index + '.html';
        //console.log("trying new",newTarg);
    }
    // make backup of origTarg
    if (backup)
        fs.copySync(origTarg,newTarg);

    // copy ssource to origTarg
    fs.writeFileSync(origTarg,content);

    if (origTarg===newTarg) return null;
    return newTarg;     // return the backed up filename
}
