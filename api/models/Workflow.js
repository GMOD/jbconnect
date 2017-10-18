/* 
 * @module
 * @description 
 * A Workflow Manager is the entity that manages a workflow engine which can be either
 * *Galaxy* or the JBServer standalone workflow engine.
 */

var Workflow = {
    // Enforce model schema in the case of schemaless databases
    schema: false,
    
    attributes: {

      serviceName: {
        type: 'string'
      }
    },
    
    addService: function(service,cb) {
        sails.log(">>> workflow.addService",service);
        cb();
    }
};

module.exports = Workflow;

