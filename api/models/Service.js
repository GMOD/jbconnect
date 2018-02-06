/** 
 * @module
 * @description 
 * 
 * The service module implements the job service frameowrk which are installable 
 * modules that can host web services and be a job execution processing for a particular
 * type of job.
 * 
 * Installable services are generally named <servicename>Service.js and reside in the
 * api/services directory.  For example: a job service built into this project is 
 * serverSearchService.js
 * 
 * `api/services/serviceProc.js` is the bettr part of the implementation of service
 * 
 * Job services are defined in `config/globals.js` in the jbrowse/services section.
 * 
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
    
    
    Init: serviceProc.init,
    
    /**
     * Get list of tracks based on critera in params  
     * @param {object} params - search critera (i.e. {id: 1,user:'jimmy'} )
     * @param {function} cb - callback function(err,array)
     */
    Get: function(params,cb) {
        this.find(params).then(function(foundList) {
           return cb(null,foundList) 
        }).catch(function(err){
           return cb(err);
        });
    },
    /**
     * 
     * @param {type} service
     *  {
     *      name: - unique service name
     *      type: - service ('service' or 'workflow')
     *      module: - module (ie 'jblast')
     *      alias: optional
     *      handler: - a function pointer to the service handler
     *  }
     * @param {type} cb
     * @returns {undefined}
     */
    Add: serviceProc.addService,
    /*
     * given service name as a string,
     * return 0 if it is a valid job service (that uses the job queue)
     * return non-zero if it is not
     */
    ValidateJobService: function(serviceStr) {
        var serviceFunc = this.Resolve(serviceStr);
        if (!serviceFunc)                                       return "service name not found: "+serviceStr;
        if (typeof serviceFunc === 'undefined')                 return "undefined service";
        if (typeof serviceFunc.beginProcessing !== 'function')  return "beginProcessing function does not exist in service";
        if (typeof serviceFunc.validateParams !== 'function')   return "validateParams function does not exist in service";
        if (typeof serviceFunc.generateName !== 'function')     return "generateName function does not exist in service";
        return 0;
    },
    /*
     * Given the service name, return the service object.
     * return 0 if not defined
     */
    Resolve: function(serviceName) {
        var svc = serviceProc.services[serviceName];
        if (typeof svc !== 'undefined') return svc;
        return null;
    }

};

module.exports = Service;

