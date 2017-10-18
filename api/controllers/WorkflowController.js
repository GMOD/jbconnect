/**
 * @module
 * @ignore
 * @description
 * todo: document 
 */

var jblastProc = require('../services/workflowProc');

module.exports = {
    enumWorkflows: workflowProc.enumWorkflows,
    getWorkflows: workflowProc.send
};

