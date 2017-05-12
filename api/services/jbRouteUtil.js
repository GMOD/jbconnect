var fs = require('fs');
var glob = require('glob');

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

        // setup sub-module plugins
        var submodules = glob.sync('node_modules/jbh-*');

            // setup local plugins
            var items = fs.readdirSync('plugins');
            for(var i in items) {

                var pluginRoute = '/'+g.routePrefix+'/plugins/'+items[i];
                var target = cwd+'/plugins/'+items[i];

                if (fs.lstatSync(target).isDirectory())
                    this.addRoute(params,'this module',pluginRoute,target);
            }

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
    addRoute: function(params,module,route,target) {
        var app = params.app;
        var express = params.express;
        sails.log.info("adding plugin route (%s) %s %s",module,route,target);
        app.use(route, express.static(target));
    }
};