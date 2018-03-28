/**
 * @module
 * @description 
 * Support library for jbutil command
 *  
 */
var fs = require('fs-extra');
var path = require('path');
var approot = require('app-root-path'); 
var glob = require('glob');
var sh = require('shelljs');
var merge = require('deepmerge');
var config = require(approot+'/config/globals.js').globals;
var util = require('./utilFn');

module.exports = {
    dbName: 'localDiskDb.db',
    /**
     * Traverse ``jbutils-ext.js`` of submodules (jbconnect-hook-*)
     * 
     * @param {function} cb - callback
     * 
     */
    doExtScripts: function(cb) {
        var cwd = sh.pwd();

        var extScripts = glob.sync(approot+'/node_modules/jbconnect-hook-*');
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
     * Merged from ``jbconnect-hook-*`` ``config/globals.js``, local ``config/globals.js``
     */
    getMergedConfig() {
        var cwd = sh.pwd();

        var merged = {};

        var scripts = glob.sync(approot+'/node_modules/jbconnect-hook-*');
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

        let aggregate = merge(merged,config);
        
        aggregate = util.mergeConfigJs(aggregate);
        
        // make sure webIncludes for JBConnect come before webIncludes of hooks
        if (typeof merged.jbrowse !== 'undefined' && typeof merged.jbrowse.webIncludes !== 'undefined') { 
            aggregate.jbrowse.webIncludes = config.jbrowse.webIncludes;
            aggregate.jbrowse.webIncludes = merge(aggregate.jbrowse.webIncludes,merged.jbrowse.webIncludes);
        }
        
        return aggregate.jbrowse;
    },
    /**
     * @param {string} filter - (ie. ".css" or ".js")
     * @returns {Array} the aggregated client dependencies from webIncludes.
     */
    getClientDependencies(filter) {
        let config = this.getMergedConfig();

        let deps = [];
        let wIncludes = config.webIncludes;
        for(let i in wIncludes) {
            if (wIncludes[i].lib.toLowerCase().indexOf(filter) >=0)
                deps.push(wIncludes[i].lib);
        }
        return deps;        
    },
    /**
     * Builds an index.html based on ``/bin/index_tesmplate.html``.  It will
     * inject web includes .js and .css references.  These are defined in the config file,
     * jbrowse.webIncludes section.
     * 
     * @returns {string} content of the html file.
     * 
     */
    /*
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

        var lookFor = '<!-- JBConnect Modules -->';
        content = content.replace(lookFor,str);

        //console.log(content);

        return content;
    },
    */
    /**
     * Writes the index.html file. A backup of the original index.html will be made.
     * 
     * @param {object} config 
     * @returns {undefined}
     */
    /*
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
    */
    
    /**
     * add plugins to ``trackList.json``.
     * 
     * @param {object} config - reference the configuration.
     * 
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
     * 
     * @param {string} src - source
     * @param {string} origTarg - target
     * @returns {string} final target filename
     *  
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
    /**
     * if content is the same as target, do nothing.
     * if content is different than  target, write new content to target file.
     * 
     * @param {type} content - content to write
     * @param {type} origTarg - target file
     * @returns {string} backuped up filename
     * 
     */
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
    /**
     * Install the sails database from ``./bin``.
     * 
     * @param {int} overwrite - 0, do not overwrite db.  1, overwrite db.
     * 
     */
    install_database: function(overwrite) {
        var dbSrc = approot+'/bin/'+this.dbName;
        var dbTargDir = approot+'/data/';
        var dbTarg = approot+'/data/'+this.dbName;

        try {
            fs.ensureDirSync(dbTargDir);
            if (overwrite === 1) {
                console.log("Setting up default JBConnect database...");
                sh.cp(dbSrc,dbTarg+this.dbName);
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
        
    },
    injectPlugins(params){
        // inject plugin routes
        var g = sails.config.globals.jbrowse;

        var sh = require('shelljs');
        var cwd = sh.pwd();
        let pluginDir = g.jbrowsePath+'plugins';

        // check if jbrowse dir exists
        if (!fs.existsSync(g.jbrowsePath)) {
            console.log("JBrowse directory does not exist:",g.jbrowsePath);
            process.exit(1);
        }

        // setup local plugins
        var items = fs.readdirSync('plugins');
        for(var i in items) {

            //var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
            let target = pluginDir+'/'+items[i];
            let src = cwd+'/plugins/'+items[i];

            _symlink(src,target);
        }

        // setup sub-module plugins
        var submodules = glob.sync('node_modules/jbconnect-hook-*');
        for(var j in submodules) {
            var tmp = submodules[j].split('/');                
            var moduleName = tmp[tmp.length-1];

            var items = fs.readdirSync(cwd+'/'+submodules[j]+'/plugins');
            for(var i in items) {
                //var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
                let target = pluginDir+'/'+items[i];
                let src = cwd+'/'+submodules[j]+'/plugins/'+items[i];
                
                _symlink(src,target);
            }
        }
        
        function _symlink(src,target) {
            console.log("plugin inject",src,target);
            if (!fs.existsSync(src))
                fs.symlinkSync(src,target,'dir');
        }
    },    
    /**
     * Add a route
     * 
     * @param {object} params - eg. ``{app: <app-object>,express: <express-object>}``
     * @param {string} module - the module name (ie. ``"jquery"``)
     * @param {string} route - the route (ie. ``"/jblib/jquery"``)
     * @param {string} target - the target (ie ``"/var/www/html/jbconnect/node_modules/jquery"``)
     */
    addRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        sails.log.info("adding libroute (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    },
    /**
     * Add a plugin route
     * 
     * @param {object} params - eg. ``{app: <app-object>,express: <express-object>}``
     * @param {string} module - the module name (ie. ``"jblast"``)
     * @param {string} route - the route (ie. ``"/jbrowse/plugins/JBlast"``)
     * @param {string} target - the target (ie ``"/var/www/html/jbconnect/node_modules/jbconnect-hook-jblast/plugins/JBlast"``)
     * 
     */
    addPluginRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        sails.log.info("adding plugin route (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    }
    
    
};


