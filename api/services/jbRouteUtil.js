/**
 * @module
 * 
 * @description 
 * This module provides functions to inject plugin routes and library routes
 * that are accessible by the client side.
 * 
 * 
 */
var fs = require('fs');
var glob = require('glob');
var merge = require('merge');

module.exports = {
    /**
     * inject client-side plugins into the clinet plugin directory as routes.
     * handles submodules plugins too.
     * @returns {undefined}
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
                this.addRoute(params,'this module',pluginRoute,target);
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
                    this.addRoute(params,moduleName,pluginRoute,target);
            }
        }
    },    
    /**
     * Add library routes 
     */
    addLibRoutes: function(params) {
        var g = sails.config.globals.jbrowse;
        var libRoutes = sails.config.globals.libroutes;
        var sh = require('shelljs');
        var cwd = sh.pwd();

        // look for config/libroute.js files in submodules
        var routefile = glob.sync('node_modules/jbh-*/config/libroutes.js');
        for(var k in routefile) {
            sails.log.debug('>>> routefile',routefile[k]);
            var moduleRoutes = require(cwd+'/'+routefile[k]);
            libRoutes.lib = merge(libRoutes.lib,moduleRoutes.lib);
        }
        //sails.log.debug('>>> libRoutes',libRoutes);

        for(var i in libRoutes.lib) {
            // look for submodule
            var submodules = glob.sync('node_modules/'+i);
            for(var j in submodules) {
                var tmp = submodules[j].split('/');                
                var moduleName = tmp[tmp.length-1];
                //sails.log.debug(">>> libroute",i,libRoutes.lib[i],cwd+'/'+submodules[j]);
                
                var pluginRoute = libRoutes.lib[i];
                var target = cwd+'/'+submodules[j];
                if (fs.lstatSync(target).isDirectory()) {
                    //sails.log.info("adding libroute route %s %s",pluginRoute,target);
                    this.addRoute(params,moduleName,pluginRoute,target);
                }
                break;
            }
        }

    },
    /**
     * Add a route
     * 
     * @param {type} params
     * @param {type} module
     * @param {type} route
     * @param {type} target
     * @returns {undefined}
     */
    addRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        sails.log.info("adding route (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    }
};