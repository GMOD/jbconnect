/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fs = require('fs-extra');
var path = require('path');
var approot = require('app-root-path'); 
var glob = require('glob');
var sh = require('shelljs');
var merge = require('deepmerge');

module.exports = {
    /**
     * Traverse jbutils-ext.js of submodules (jbh-*)
     * @param {type} cb
     * @returns {undefined}
     */
    doExtScripts: function(cb) {
        var cwd = sh.pwd();

        var extScripts = glob.sync(approot+'/node_modules/jbh-*');
        extScripts.push(approot);
        //console.log("extScripts",extScripts)
        for(var i in extScripts) {
            //console.log('script found - ',extScripts[i]);
            var path = extScripts[i];
            var extScript = extScripts[i]+'/bin/jbutil-ext.js';
            console.log("extScript",extScript);
            if (fs.existsSync(extScript)) { 
              var ext = require(extScript);
              cb(ext,path);
            }
        }
    },

    /**
     * Returned merged jbrowse config.  
     * Merged from jbh-* config/globals.js, local config/globals.js, & config.js
     */
    getMergedConfig: function() {
        var cwd = sh.pwd();

        var merged = {};

        var scripts = glob.sync(approot+'/node_modules/jbh-*');
        console.log('scripts',scripts);

        for(var i in scripts) {
            //console.log('script found - ',scripts[i]);
            var path = cwd+'/'+scripts[i];
            var extScript = '../'+scripts[i]+'/config/globals.js';
            if (fs.existsSync(extScript)) { 
              // do something 
              var extConfig = require(extScript).globals;
              //console.log('extConfig',extConfig);
              merged = merge(extConfig,merged);
            }
        }

        var config = require('../config/globals.js').globals;
        //console.log('config',config);
        merged = merge(config,merged);

        return merged.jbrowse;
    },

    buildHtml: function() {
        var conf = this.getMergedConfig();
        var indexFile = approot+'/bin/index_template.html';

        var content = fs.readFileSync(indexFile,'utf-8');

        //console.log("conf",conf);
        var str = "";

        for(var i in conf.webIncludes) {
            //console.log(i);
            if (conf.webIncludes[i].lib.indexOf('.js') !== -1) {
                str += '<script type="text/javascript" src="'+conf.webIncludes[i].lib+'"></script>\n';
            }
            if (conf.webIncludes[i].lib.indexOf('.css') !== -1) {
                str += '<link type="text/css" rel="stylesheet" href="'+conf.webIncludes[i].lib+'" />\n';
            }
        }
        //console.log(str);

        var lookFor = '<!-- JBServer Modules -->';
        content = content.replace(lookFor,str);

        //console.log(content);

        return content;
    },
    /**
     * 
     * @param {type} params 
     * @returns {undefined}
     */
    exec_setupindex: function(params) {
        var g = params.config;

        var content = this.buildHtml();

        var srcpath = path.normalize(approot+"/bin");
        console.log("processing --setupindex");
        console.log(srcpath+'/index.html',g.jbrowsePath+'index.html');

        //var bakfile = safeCopy(srcpath+'/index.html',g.jbrowsePath+'/index.html');
        var bakfile = this.safeWriteFile(content,g.jbrowsePath+'/index.html');
        if (bakfile)
            console.log('a backup of jbrowse/index.html was made in', bakfile);
        else
            console.log('index.html content unchanged.');
    },
    /**
     * copy src to targ, but if targ exists, it will backup the target by appending a number
     * @param {string} src source
     * @param {string} targ target
     * @returns {string} final target filename, 
     */
    safeCopy: function(src,origTarg) {

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
    },
    safeWriteFile: function(content,origTarg) {

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
    
};


