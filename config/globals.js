/**
 * @global
 * @description
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.globals.html
 * 
 * Note: globals defined in jbserver take precedent over jbh-* module globals.js definitions. 
 */

var merge = require('deepmerge');
var approot = require('app-root-path');
var jbPath = approot + "/node_modules/jbrowse/";
var util = require(approot+"/api/services/utilFn");

var g = {
    
    jbrowse: {
        jbrowseRest: "http://localhost:1337",
        jbrowsePath: jbPath,                        // or "/var/www/jbrowse/"
        routePrefix: "jbrowse",                     // jbrowse is accessed with http://<addr>/jbrowse
        
        dataSet: {
             Volvox: {path: "sample_data/json/volvox"}
        },
        
        // search service settings
        serverSearch: {
            resultPath: "ServerSearch",
            resultCategory: "Search Results",
            trackTemplate: "ServerSearchTrackTemplate.json",
            workflowScript: "ServerSearch.workflow.js",
            processScript:   'ServerSearchProcess.html'
        },
        // search job service registration
        services: {
            'serverSearchService': {name: 'serverSearchService',  type: 'service'}
        },
        
        /*
         * Virtual Routes
         * These routes reference node_modules that are used by the client and
         * accessed by virtual route.
         */
        libRoutes: {
            // name         node_modules dir            virtual route
            'jquery':       {module: 'jquery',          vroute:'/jblib/jquery'},
            'bootstrap':    {module: 'bootstrap',       vroute:'/jblib/bootstrap'},
            'jqueryui':     {module: 'jquery-ui-dist',  vroute:'/jblib/jquery-ui'},
            'mbextruder':   {module: 'jquery.mb.extruder', vroute:'/jblib/mb.extruder'}
        },
        /*
         * Web Includes
         * These includes are injected into JBrowse ``index.html`` upon ``sails lift``.
         */
        webIncludes: {
            "css-bootstrap":         {lib: "/jblib/bootstrap/dist/css/bootstrap.min.css"},
            "css-mbextruder":        {lib: "/jblib/mb.extruder/css/mbExtruder.css"},
            "css-jqueryui":          {lib: "/jblib/jquery-ui/jquery-ui.min.css"},
            "css-jqueryuistructure": {lib: "/jblib/jquery-ui/jquery-ui.structure.min.css"},
            "css-jqueryuitheme":     {lib: "/jblib/jquery-ui/jquery-ui.theme.min.css"},
            "js-sailsio":            {lib: "/js/dependencies/sails.io.js"},
            "js-jquery":             {lib: "/jblib/jquery/dist/jquery.min.js" },
            "js-jqueryui":           {lib: "/jblib/jquery-ui/jquery-ui.min.js" },
            "js-bootstrap":          {lib: "/jblib/bootstrap/dist/js/bootstrap.min.js"},
            "js-mbextruderHover":    {lib: "/jblib/mb.extruder/inc/jquery.hoverIntent.min.js"},
            "js-mbextruderFlip":     {lib: "/jblib/mb.extruder/inc/jquery.mb.flipText.js"},
            "js-mbextruder":         {lib: "/jblib/mb.extruder/inc/mbExtruder.js"}
        }
    }

  /****************************************************************************
  *                                                                           *
  * Expose the lodash installed in Sails core as a global variable. If this   *
  * is disabled, like any other node module you can always run npm install    *
  * lodash --save, then var _ = require('lodash') at the top of any file.     *
  *                                                                           *
  ****************************************************************************/

	// _: true,

  /****************************************************************************
  *                                                                           *
  * Expose the async installed in Sails core as a global variable. If this is *
  * disabled, like any other node module you can always run npm install async *
  * --save, then var async = require('async') at the top of any file.         *
  *                                                                           *
  ****************************************************************************/

	// async: true,

  /****************************************************************************
  *                                                                           *
  * Expose the sails instance representing your app. If this is disabled, you *
  * can still get access via req._sails.                                      *
  *                                                                           *
  ****************************************************************************/

	// sails: true,

  /****************************************************************************
  *                                                                           *
  * Expose each of your app's services as global variables (using their       *
  * "globalId"). E.g. a service defined in api/models/NaturalLanguage.js      *
  * would have a globalId of NaturalLanguage by default. If this is disabled, *
  * you can still access your services via sails.services.*                   *
  *                                                                           *
  ****************************************************************************/

	// services: true,

  /****************************************************************************
  *                                                                           *
  * Expose each of your app's models as global variables (using their         *
  * "globalId"). E.g. a model defined in api/models/User.js would have a      *
  * globalId of User by default. If this is disabled, you can still access    *
  * your models via sails.models.*.                                           *
  *                                                                           *
  ****************************************************************************/

	// models: true
};

g = util.mergeConfigJs(g);


module.exports.globals = g;

