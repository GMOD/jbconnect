/**
 * @module
 * @description 
 * Support library for jbutil command
 * 
 */
/* istanbul ignore file */
const fs = require('fs-extra');
const path = require('path');
const approot = require('app-root-path'); 
const glob = require('glob');
const sh = require('shelljs');
const merge = require('deepmerge');
const config = require(approot+'/config/globals.js').globals;
const util = require('./utilFn');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const _ = require('lodash');

module.exports = {
    dbName: 'localDiskDb.db',
    /**
     * Traverse ``jbutils-ext.js`` of submodules (*-jbconnect-hook)
     * 
     * @param {function} cb - callback
     * 
     */
    doExtScripts: function(cb) {
        var cwd = sh.pwd();

        var extScripts = glob.sync(approot+'/node_modules/*-jbconnect-hook');
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
     * Merged from ``*-jbconnect-hook`` ``config/globals.js``, local ``config/globals.js``
     */
    getMergedConfig() {
        var cwd = sh.pwd();

        var merged = {};

        var scripts = glob.sync(approot+'/node_modules/*-jbconnect-hook');
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
     * Inject css/js into JBrowse index.html
     */
    injectIncludesIntoHtml() {
        let config = this.getMergedConfig();
        let index = config.jbrowsePath+'index.html';
        let webIncludes = config.webIncludes;
        let insertThis = [];
        let indexModified = false;
        let countInc = 0;
        
        // count webIncludes
        let count = 0;
        for(let i in webIncludes) count++;
        
        if (count) {
            let sectionStart = {
                    "node": "comment",
                    "text": " JBConnect injector "
            };
            let sectionEnd = {
                    "node": "comment",
                "text": " JBConnect injector END "
            };
            let newLine = {
                    "node": "text",
                    "text": "\n"
            };
            let blankLine = {
                    "node": "text",
                    "text": "\n\n"
            };
            let jsTemplate = {
                    "node": "element",
                    "tag": "script",
                    "attr": {
                            "src": "/jblib/mbExtruder.js"
                    },
                    "child": [
                            {
                                    "node": "text",
                                    "text": ""
                            }
                    ]
            };
            let cssTemplate = {
                    "node": "element",
                    "tag": "link",
                    "attr": {
                            "rel": "stylesheet",
                            "href": "/jblib/jquery.min.css"
                    }
            };
            
            // build injection list (insertThis)
            insertThis = [blankLine,sectionStart,newLine];

            for(let i in webIncludes) {
                
                if (webIncludes[i].lib.indexOf('.js') !== -1) {
                    console.log("including "+webIncludes[i].lib);
                    let newItem = _.cloneDeep(jsTemplate);
                    newItem.attr.src = webIncludes[i].lib;
                    insertThis.push(newItem);
                    insertThis.push(newLine);
                    countInc++;
                }
                if (webIncludes[i].lib.indexOf('.css') !== -1) {
                    console.log("including "+webIncludes[i].lib);
                    let newItem = _.cloneDeep(cssTemplate);
                    newItem.attr.href = webIncludes[i].lib;
                    insertThis.push(newItem);
                    insertThis.push(newLine);
                    countInc++;
                }
            }
            insertThis.push(sectionEnd);
        }
        
        // read the index file
        let content  = fs.readFileSync(index,'utf-8');
        let json = html2json(content);

        let n = json.child[0].child;
        head = _.findIndex(n, function(o) { return o.tag === 'head'; });    // index of <head>
        n = n[head].child;
        title = _.findIndex(n, function(o) { return o.tag === 'title'; });  // index of <title>

        // n is now the array of <head> section

        // remove existing JBConnector section (if any)
        let bStart = _.findIndex(n, function(o) { return o.text === ' JBConnect injector '; });
        if (bStart > -1) {
                let bEnd = _.findIndex(n, function(o) { return o.text === ' JBConnect injector END '; });

                n.splice(bStart,bEnd-bStart+2);
                //console.log("head elements",n);
                
                indexModified = true;
        }

        if (count) {
            // insert new JBConnector section below <title>
            n.splice.apply(n, [title+1, 0].concat(insertThis));
            indexModified = true;
        }    

        if (indexModified) {
            
            // reconstitute new <head> section
            json.child[0].child[head].child = n;

            let newContent = "<!DOCTYPE html>\n"+json2html(json);
            //console.log(newContent);
            
            // write file
            fs.writeFileSync(index,newContent);
        }
        console.log(countInc+" modules injected in index.html");

    },
    
    /**
     * add plugins to ``trackList.json``.
     * 
     */
    setupPlugins: function() {
        let g = this.getMergedConfig();

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

            let plugins = this.getPlugins();
            
            if (plugins.length === 0)   return;

            // add the JBlast & JBClient plugin, if they don't already exist
            for(let i in plugins) {
                if (conf.plugins.indexOf(plugins[i].name) === -1) conf.plugins.push(plugins[i].name);
            }
            //if (conf.plugins.indexOf('JBClient') === -1) conf.plugins.push("JBClient");
            //if (conf.plugins.indexOf('ServerSearch') === -1) conf.plugins.push("ServerSearch");


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
     * remove css/js from JBrowse index.html
     * 
     */
    removeIncludesFromHtml() {
        let config = this.getMergedConfig();
        let index = config.jbrowsePath+'index.html';
        let insertThis = [];
        let indexModified = false;
        
        // read the index file
        let content  = fs.readFileSync(index,'utf-8');
        let json = html2json(content);

        let n = json.child[0].child;
        head = _.findIndex(n, function(o) { return o.tag === 'head'; });    // index of <head>
        n = n[head].child;
        title = _.findIndex(n, function(o) { return o.tag === 'title'; });  // index of <title>

        // n is now the array of <head> section

        // remove existing JBConnect section (if any)
        let bStart = _.findIndex(n, function(o) { return o.text === ' JBConnect injector '; });
        if (bStart > -1) {
                let bEnd = _.findIndex(n, function(o) { return o.text === ' JBConnect injector END '; });

                n.splice(bStart,bEnd-bStart+2);
                
                indexModified = true;
        }

        if (indexModified) {
            
            // reconstitute new <head> section
            json.child[0].child[head].child = n;

            let newContent = "<!DOCTYPE html>\n"+json2html(json);
            //console.log(newContent);
            
            // write file
            fs.writeFileSync(index,newContent);
            
            console.log("Removed JBConnect dependencies from index.html");
        }
        
    },
    /**
     * remove plugins from ``trackList.json``.
     * 
     */
    unsetupPlugins: function() {
        let g = this.getMergedConfig();

        // get dataSet
        var dataSet = "-----";
        for(var i in g.dataSet) {
            dataSet = g.dataSet[i].path;

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

            let jbplugins = this.getPlugins();
            //console.log("jbplugins",jbplugins);
            
            if (jbplugins.length === 0)   return;

            let xPlugins = [];
            let countRemoved = 0;
            
            // add the JBlast & JBClient plugin, if they don't already exist
            for(let i in conf.plugins) {
                let x = _.findIndex(jbplugins, function(o) { return o.name === conf.plugins[i]; });
                //console.log(conf.plugins[i],x);
                if (x === -1) xPlugins.push(conf.plugins[i]);
                else countRemoved++;
            }
            //console.log("xPlugins",xPlugins);
            conf.plugins = xPlugins;
            
           // write trackList.json
            try {
              fs.writeFileSync(trackListPath,JSON.stringify(conf,null,4));
            }
            catch(err) {
              console.log("failed write",trackListPath,err);
            }
            console.log(countRemoved+' plugins removed from dataset: '+dataSet);
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
        
    },
    /**
     * cleanout redis database
     */
    zapRedis() {
        console.log("Cleaning redis database...");
        let redis = require("redis").createClient();

        redis.on("error", function (err) {
            console.log("Error " + err);
        });
        redis.keys("*", function (err, replies) {
            if (replies.length === 0) {
                console.log ('no redis records - nothing to delete');
            }
            else {
                console.log('deleting '+replies.length + ' keys:');
                replies.forEach(function (reply, i) {
                    if (reply.startsWith("q:")) {
                        console.log("    " + reply);
                        redis.del(reply);
                    }
                });
            }
            redis.quit();
        });            
        
    },
    /**
     * Inject client-side plugins into the JBrowse plugins dir
     * 
     * Note: as of JBrowse 1.13.0, you must run `npm run build` after this function, webpack build.
     * called in sails lift /tasks/register .. jb-inject-plugins to function properly
     * 
     * if env E2E_COVERAGE is defined, it will instrument the plugins before installing.
     * 
     * Example:
     * // injects plugins and instruments JBClient plugin and builds webpack in JBrowse
     * ./jbutil --pushplugins --coverage JBClient --buildwebpack
     * 
     * @param {string} plugin if defined (ie. "JBClient"), it will instrument the given plugin
     * 
     * @returns (int) count - count of plugins injected.
     */
    injectPlugins(plugin){
        // inject plugin routes
        let g = this.getMergedConfig();

        let sh = require('shelljs');
        let cwd = sh.pwd();
        let pluginDir = g.jbrowsePath+'plugins';
        let count = 0;  // count of injected plugins

        //fs.appendFileSync('./.nyc_output/log.out','injectPlugins '+new Date().toISOString());

        /*
        let _link = _symlink;
        console.log('E2E_COVERAGE',process.env.E2E_COVERAGE);
        if (process.env.E2E_COVERAGE) {
            let e2e = process.env.E2E_COVERAGE;
            if (e2e.toUpperCase()==="TRUE") {
                console.log("********* installing coverage instrumented plugins **********");
                _link = _symlinkCoverage;
            } 
        }
        */
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

            if (plugin && src.indexOf(plugin) !== -1) _symlinkCoverage(src,target);
            else _symlink(src,target);
        }

        // setup sub-module plugins
        //console.log("injecting submodule plugins");
        let submodules = glob.sync('node_modules/*-jbconnect-hook');
        let subcount = 0;
        for(var j in submodules) {
            let tmp = submodules[j].split('/');                
            let moduleName = tmp[tmp.length-1];

            var items = fs.readdirSync(cwd+'/'+submodules[j]+'/plugins');
            for(var i in items) {
                //var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
                let target = pluginDir+'/'+items[i];
                let src = cwd+'/'+submodules[j]+'/plugins/'+items[i];
                
                if (plugin && src.indexOf(plugin) !== -1) _symlinkCoverage(src,target);
                else _symlink(src,target);

                subcount++;
            }
        }
        console.log("submodule plutins: "+subcount);
        return count;
        
        function _symlink(src,target) {
            //console.log("_symlink",src,target);

            // unlink target
            //if (fs.existsSync(target))  {
                cmd = 'unlink '+target;
                sh.exec(cmd);
            //}
            try {
                cmd = 'ln -s '+src+' '+target;
                sh.exec(cmd);
            }
            catch(err) {
                console.log("faild ",cmd,err);
            }
            console.log("Plugin:",target);
            
            // check if it got created
            if (!fs.existsSync(target)) {
                throw "Failed to symlink "+target;
            }
            else count++;
        }
        // instruments plugin. stores the instrumented plugin in tmp
        function _symlinkCoverage(src,target) {
            //console.log("_symlinkCoverage",src,target);

            // nyc (instrument) instrument the plugin
            // the instrumented plugin will be in the tmp dir
            _instrumentDir(src,target);

            // unlink target
            //if (fs.existsSync(target))  {//fs.unlinkSync(target);
                cmd = 'unlink '+target;
                sh.exec(cmd);
            //}
            cmd = 'ln -s '+_tmpPluginDir(src)+' '+target;
            sh.exec(cmd);

            console.log("Plugin (instrumented):",target);

            // check if it got created
            if (!fs.existsSync(target)) {
                throw "Failed to symlink "+target;
            }
            else count++;
        }
        // copy plugin and instrument in tmp
        function _instrumentDir(src,target) {

            let cmd = 'rm -rf '+_tmpPluginDir(src);
            if (fs.existsSync(_tmpPluginDir(src))) sh.exec(cmd);

            // copy plugin into tmp dir
            try {
                cmd  = 'cp -r '+src+' '+_tmpPluginDir(src);
                //console.log(cmd);
                sh.exec(cmd);
            }
            catch(err) {
                console.log("error copying plugin ",src,'to',_tmpPluginDir(src),err);
                return;
            }

            // call nyc instrument plugins/<plugin> tmp/<plugin>
            cmd = 'node_modules/nyc/bin/nyc.js instrument '+src+' '+_tmpPluginDir(src);
            //console.log(cmd);
            try {
                sh.exec(cmd);
            }
            catch(err) {
                console.log('nyc instrument error',err);
            }
        }
        function _tmpPluginDir(src) {
            let str = src.split("/plugins");
            return approot+'/tmp'+str[1];
        }
    },  
    buildWebpack() {
        const conf = this.getMergedConfig();
        const origPath = process.cwd();
        
        let setupScript = "./setup.sh";
        setupScript = "npm run build";
        
        // check if jbrowse is a module
        if (fs.existsSync(conf.jbrowsePath)) {
            sh.cd(conf.jbrowsePath);
            console.log("JBrowse path",process.cwd());
        }
        else {
            console.log("could not find jbrowse.  check if jbrowsePath is defined.");
            process.exit(1);
        }
        
        sh.exec(setupScript);
        sh.cd(origPath);
    },  
    /**
     * remove client side plugins from JBrowse index.html
     */
    removePlugins() {
        var g = this.getMergedConfig();

        var sh = require('shelljs');
        var cwd = sh.pwd();
        let pluginDir = g.jbrowsePath+'plugins';
        let countRemoved = 0;

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

            _unlink(src,target);
        }

        // setup sub-module plugins
        var submodules = glob.sync('node_modules/*-jbconnect-hook');
        for(var j in submodules) {
            var tmp = submodules[j].split('/');                
            var moduleName = tmp[tmp.length-1];

            var items = fs.readdirSync(cwd+'/'+submodules[j]+'/plugins');
            for(var i in items) {
                //var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
                let target = pluginDir+'/'+items[i];
                let src = cwd+'/'+submodules[j]+'/plugins/'+items[i];
                
                _unlink(src,target);
            }
        }
        
        console.log(countRemoved+" plugins removed JBrowse plugins dir.");
        if (countRemoved)
            console.log("In jbrowse directory, run 'npm run build'");

        return countRemoved;
        
        function _unlink(src,target) {
            if (fs.existsSync(target)) {
                console.log("Unlink plugin",target);
                fs.unlinkSync(target);
                countRemoved++;
            }
        }
    },
    /**
     * get the list of plugins.  This includes JBConnect plugins as well as plugins of JBConnect hook modules that are loaded.
     * @returns {object} array of plugin objects
     */
    getPlugins() {
        var g = this.getMergedConfig();

        var sh = require('shelljs');
        var cwd = sh.pwd();
        let pluginDir = g.jbrowsePath+'plugins';
        let plugins = [];
        let excludePlugins = g.excludePlugins;

        // setup local plugins
        var items = fs.readdirSync('plugins');
        for(var i in items) {

            let target = pluginDir+'/'+items[i];
            let src = cwd+'/plugins/'+items[i];

            let exclude = _.find(excludePlugins, function(val,plugin) { return plugin === items[i] && val===true; });
            if (!exclude) _insert(items[i],src,target);
        }

        // setup sub-module plugins
        var submodules = glob.sync('node_modules/*-jbconnect-hook');
        for(var j in submodules) {
            var tmp = submodules[j].split('/');                
            var moduleName = tmp[tmp.length-1];

            var items = fs.readdirSync(cwd+'/'+submodules[j]+'/plugins');
            for(var i in items) {
                let target = pluginDir+'/'+items[i];
                let src = cwd+'/'+submodules[j]+'/plugins/'+items[i];
                
                let exclude = _.find(excludePlugins, function(val,plugin) { return plugin === items[i] && val===true; });
                if (!exclude) _insert(items[i],src,target);
            }
        }
        return plugins;
        function _insert(name,src,target) {
            plugins.push({
                name:name,
                src:src,
                target:target
            });
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
        console.log("adding libroute (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    },
    /**
     * Add a plugin route
     * 
     * @param {object} params - eg. ``{app: <app-object>,express: <express-object>}``
     * @param {string} module - the module name (ie. ``"jblast"``)
     * @param {string} route - the route (ie. ``"/jbrowse/plugins/JBlast"``)
     * @param {string} target - the target (ie ``"/var/www/html/jbconnect/node_modules/jblast-jbconnect-hook/plugins/JBlast"``)
     * 
     */
    addPluginRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        console.log.info("adding plugin route (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    }
    
    
};


