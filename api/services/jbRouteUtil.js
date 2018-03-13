/**
 * @module
 * 
 * @description 
 * This module provides functions to inject plugin routes and library routes
 * that are accessible by the client side.
 * 
 */
var fs = require('fs');
var glob = require('glob');
var merge = require('merge');

module.exports = {
    /**
     * inject client-side plugins into the clinet plugin directory as routes.
     * handles submodules plugins too.
     *  
     * @param {object} params - eg. ``{app: <app-object>,express: <express-object>}``
     *    
     */
    addPluginRoutes: function(params){
        // inject plugin routes
        var g = sails.config.globals.jbrowse;

        var sh = require('shelljs');
        var cwd = sh.pwd();


        // setup local plugins
        var items = fs.readdirSync('plugins');
        for(var i in items) {

            var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
            var target = cwd+'/plugins/'+items[i];

            if (fs.lstatSync(target).isDirectory())
                this.addPluginRoute(params,'this module',pluginRoute,target);
        }

        // setup sub-module plugins
        var submodules = glob.sync('node_modules/jbh-*');
        for(var j in submodules) {
            var tmp = submodules[j].split('/');                
            var moduleName = tmp[tmp.length-1];

            var items = fs.readdirSync(cwd+'/'+submodules[j]+'/plugins');
            for(var i in items) {
                var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
                var target = cwd+'/'+submodules[j]+'/plugins/'+items[i];
                if (fs.lstatSync(target).isDirectory())
                    this.addPluginRoute(params,moduleName,pluginRoute,target);
            }
        }
    },    
    /**
     * Add library routes 
     * 
     * @param {object} params - eg. ``{app: <app-object>,express: <express-object>}``
     *    
     */
    addLibRoutes: function(params) {
        var g = sails.config.globals.jbrowse;
        var libRoutes = sails.config.globals.libroutes;
        var sh = require('shelljs');
        var cwd = sh.pwd();
        
        for(var i in g.libRoutes) {
            var moduleName = i;
            var pluginRoute = g.libRoutes[i].vroute;
            var target = cwd+'/node_modules/'+g.libRoutes[i].module;
            if (fs.lstatSync(target).isDirectory()) {
                this.addRoute(params,moduleName,pluginRoute,target);
            }
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
     * @param {string} target - the target (ie ``"/var/www/html/jbconnect/node_modules/jbh-jblast/plugins/JBlast"``)
     * 
     */
    addPluginRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        sails.log.info("adding plugin route (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    }
};