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
 * Note: globals defined in jbconnect take precedent over jbconnect-hook-* module globals.js definitions. 
 */

var approot = require('app-root-path');
var jbPath = approot + "/node_modules/@gmod/jbrowse/";
var jblib = require(approot+"/api/services/jbutillib");

var g = {
    
    jbrowse: {
        jbrowseRest: "http://localhost:1337",
        jbrowsePath: jbPath,                        // or "/var/www/jbrowse/"
        routePrefix: "jbrowse",                     // jbrowse is accessed with http://<addr>/jbrowse
        
        /*
         * Datasets
         * (paths relative the JBrowse directory)
         */
        dataSet: {
            Volvox: {
               path: "sample_data/json/volvox",
               featureMapping: 'query'
            }
        },

	      // default dataset after successful login (optional.  if not defined then the first dataSet is used)
	      defaultDataSet: "Volvox",
        
        // search service settings
//        serverSearch: {
//            resultPath: "ServerSearch",
//            resultCategory: "Search Results",
//            trackTemplate: "ServerSearchTrackTemplate.json",
//            workflowScript: "ServerSearch.workflow.js",
//            processScript:   'ServerSearchProcess.html'
//        },
        // search job service registration
        services: {
          'workflowService':       {enable: true, name: 'workflowService',  type: 'workflow', alias: "workflow"},
          'serverSearchService':  {enable: false, name: 'serverSearchService',  type: 'service'},
          'nothingBurgerService': {name: 'nothingBurgerService',  type: 'service'}
        },
        
        /*
         * Web Includes
         * These includes are injected into JBrowse upon sails lift (see tasks/pipeline.js).
         */
        webIncludes: {
            "css-bootstrap":         {lib: "/jblib/bootstrap.min.css"},
            "css-mbextruder":        {lib: "/jblib/mb.extruder/mbExtruder.css"},
            "css-jqueryui":          {lib: "/jblib/jquery-ui.min.css"},
            "css-jqueryuistructure": {lib: "/jblib/jquery-ui.structure.min.css"},
            "css-jqueryuitheme":     {lib: "/jblib/jquery-ui.theme.min.css"},
            "js-sailsio":            {lib: "https://cdn.jsdelivr.net/npm/sails.io.js-dist@1.1.13/sails.io.min.js"},
            "js-jquery":             {lib: "/jblib/jquery.min.js" },
            "js-jqueryui":           {lib: "/jblib/jquery-ui.min.js" },
            "js-bootstrap":          {lib: "/jblib/bootstrap.min.js"},
            "js-mbextruderHover":    {lib: "/jblib/mb.extruder/jquery.hoverIntent.min.js"},
            "js-mbextruderFlip":     {lib: "/jblib/mb.extruder/jquery.mb.flipText.js"},
            "js-mbextruder":         {lib: "/jblib/mb.extruder/mbExtruder.js"}
        },
        excludePlugins: {
            "ServerSearch": true    // doesn't work with JBrowse 1.13.0+
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

if (jblib && jblib.mergeConfigJs)
  g = jblib.mergeConfigJs(g);


module.exports.globals = g;

