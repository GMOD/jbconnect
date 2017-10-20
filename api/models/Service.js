/* 
 * @module
 * @description 
 * A Workflow Manager is the entity that manages a workflow engine which can be either
 * *Galaxy* or the JBServer standalone workflow engine.
 */

var Service = {
    // Enforce model schema in the case of schemaless databases
    schema: false,
    
    attributes: {

      name: {
          type: 'string',
          unique: true,
          required: true
      },
      type: {
          type: 'string',
          enum: ['service', 'workflow'],
          defaultsTo: 'service',
          required: true
      },
      // this is the origin of the service,  it can be the installable hook name (i.e. 'jblast')
      module: {
          type: 'string',
          required: true
      }
    },
    
    
    init: serviceProc.init,
    
    /**
     * 
     * @param {type} service
     *  {
     *      name: - unique service name
     *      type: - service ('service' or 'workflow')
     *      source: 
     *      handler: - a function pointer to the service handler
     *  }
     * @param {type} cb
     * @returns {undefined}
     */
    addService: serviceProc.addService

};

module.exports = Service;

