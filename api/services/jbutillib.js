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
var config = require(approot+'/config/globals.js').globals;

module.exports = {
    dbName: 'localDiskDb.db',
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
            //console.log("extScript",extScript);
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
        //console.log('scripts',scripts);

        for(var i in scripts) {
            //console.log('script found - ',scripts[i]);
            var path = cwd+'/'+scripts[i];
            var extScript = scripts[i]+'/config/globals.js';
            //console.log("extScript",extScript);
            if (fs.existsSync(extScript)) { 
              // do something 
              var extConfig = require(extScript).globals;
              //console.log('extConfig',extConfig);
              merged = merge(extConfig,merged);
            }
            else {
                console.log("failed to open",extScript);
            }
        }

        //console.log('config',config);
        merged = merge(config,merged);

        return merged.jbrowse;
    },

    buildHtml: function() {
        var conf = this.getMergedConfig();
        var indexFile = approot+'/bin/index_template.html';
        var content = "";
        try {
            content = fs.readFileSync(indexFile,'utf-8');
        }
        catch(err) {
            console.log("failed to read",indexFile,err);
            return content;
        }
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
    exec_setupindex: function(config) {
        var g = config;
        //console.log("config",g);

        var content = this.buildHtml();

        var srcpath = path.normalize(approot+"/bin");
        console.log("Injecting css/js into index.html...");
        //console.log(srcpath+'/index.html',g.jbrowsePath+'index.html');

        //var bakfile = safeCopy(srcpath+'/index.html',g.jbrowsePath+'/index.html');
        var bakfile = this.safeWriteFile(content,g.jbrowsePath+'/index.html');
        if (bakfile)
            console.log('a backup of jbrowse/index.html was made in', bakfile);
        //else
        //    console.log('index.html content unchanged.');
    },
    /**
     * setup sample track
     */
    exec_setupPlugins: function(config) {
        console.log("Adding plugins to trackList.json...");
        var g = config;

        // get dataSet
        var dataSet = "-----";
        for(var i in g.dataSet) {
            dataSet = g.dataSet[i].path;

            console.log('Adding plugins to dataset', dataSet);

            var trackListPath = g.jbrowsePath + dataSet + '/trackList.json';
            //var sampleTrackFile = g.jbrowsePath + dataSet;
            //sampleTrackFile += '/'+g.jblast.blastResultPath+'/sampleTrack.json';
            //var dataSet = g.dataSet.dataPath;

            // read sampleTrack.json file
            /*
            var error = 0;
            try {
              var sampleTrackData = fs.readFileSync (sampleTrackFile,'utf8');
            }
            catch(err){
                console.log("failed read",trackListPath,err);
                error = 1;
            }
            if (error) return;
            */
            // insert blastResultPath
            /*
            //console.log("typeof sampleTrackData",typeof sampleTrackData,sampleTrackData);
            sampleTrackData = sampleTrackData.replace("[[blastResultPath]]",g.jblast.blastResultPath);
            sampleTrackData = sampleTrackData.replace("[[blastResultPath]]",g.jblast.blastResultPath);
            var sampleTrack = JSON.parse(sampleTrackData);
            */
            // read trackList.json
            var error = 0;
            try {
              var trackListData = fs.readFileSync (trackListPath);
            }
            catch(err) {
                console.log("exec_setupSearchPlugin failed read",trackListPath,err);
                error = 1;
            }
            if (error) return;

            var conf = JSON.parse(trackListData);

            // add the JBlast & JBClient plugin, if they don't already exist  
            if (conf.plugins.indexOf('JBClient') === -1) conf.plugins.push("JBClient");
            if (conf.plugins.indexOf('ServerSearch') === -1) conf.plugins.push("ServerSearch");


            // check if sample track exists in trackList.json (by checking for the label)
            /*
            var hasLabel = 0;
            for(var i in config.tracks) {
                if (config.tracks[i].label===sampleTrack.label) hasLabel=1;
            }

            if (hasLabel) {
                console.log('Sample track already exists');
                return;
            }
            // add the sample track
            conf.tracks.push(sampleTrack);
            */
            // write trackList.json
            try {
              fs.writeFileSync(trackListPath,JSON.stringify(conf,null,4));
            }
            catch(err) {
              console.log("failed write",trackListPath,err);
            }
        }
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
        if (backup) {
            try {
                fs.copySync(origTarg,newTarg);
            }
            catch(err) {
                console.log('safeCopy backup failed',origTarg,newTarg);
                
            }
        }
        // copy ssource to origTarg
        try {
            fs.copySync(src,origTarg);
        }
        catch(err) {
            console.log("safeCopy failed",src,origTarg);
        }
        if (origTarg===newTarg) return null;
        return newTarg;
    },
    safeWriteFile: function(content,origTarg) {

        var newTarg = origTarg;
        var index = 0;
        var backup = false;
        var origContent = "";
        // if new content is same as old content, abandon write
        try {
            origContent = fs.readFileSync(origTarg,'utf-8');
        }
        catch(err) {
            console.log('safeWriteFile() failed to read',origTarg,err);
            return 0;
        }
        if (origContent === content) {
            console.log('No changes in index.html content, skipping.');
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
        try {
            fs.writeFileSync(origTarg,content);
        }
        catch (err) {
            console.log('safeWriteFile failed to write',origTarg);
            return "*** not written ***";
        }
        if (origTarg===newTarg) return null;
        return newTarg;     // return the backed up filename
    },
    install_database: function(overwrite) {
        var dbSrc = approot+'/bin/'+this.dbName;
        var dbTarg = approot+'/data/';//+this.dbName;

        try {
            fs.ensureDirSync(dbTarg);
            if (overwrite === 1) {
                console.log("Setting up default JBServer database...");
                sh.cp(dbSrc,dbTarg);
            }
            else {
                if (!fs.existsSync(dbTarg)) {
                    console.log("Setting up default database...");
                    sh.cp(dbSrc,dbTarg);
                }
                else {
                    console.log("Database already exists: "+dbTarg);
                }
            }
        }
        catch (err) {
            console.log("Failed setting up default database",dbTarg, err);
        }
        
    }
    
};


