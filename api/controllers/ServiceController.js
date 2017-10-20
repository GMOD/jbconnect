/**
 * @module
 * @ignore
 * @description
 * todo: document 
 */

var jblastProc = require('../services/workflowProc');

module.exports = {
    
    // overrides settings in config/blueprints.js
    /*
    _config: {
      actions: true,
      shortcuts: true,
      rest: true
    },
    */
   
    enumServices: serviceProc.enumServices,
    execute: serviceProc.execute
};

