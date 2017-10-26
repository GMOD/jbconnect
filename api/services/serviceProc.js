/* 
 */


module.exports = {
    
    /*
     * Associative array of services, keyed by service name.
     * 
     * addService() creates the items in this list, providing quick access to
     * service handlers keyed by service name.
     * 
     * Each item:  
     *      <service name>: <service handler>
     *      
     * for example:
     *      'galaxy_blast' : <func ptr to galaxyService in jblast>    
     */
    services: {},
    
    /*
     * Associative array of service names keyed by function name.
     * 
     * addService() creates the items in this list, providing quick access to
     * services given a command name.
     * 
     * If multiple services have the same command name, the earlier registrant's
     * commands will tend to dominate.  Then, the long command form should
     * be used to address a specific service's commands.
     * 
     * Short form route:
     *      /service/exec/workflow_submit
     *      
     * Long form route:
     *      /service/exec/workflow_submit:galaxy_blast
     * 
     * 
     * 
     * Each array item:
     *      <command name> : <service name>
     * 
     * for example:
     *      'workflow_submit' : 'galaxy_blast'
     */
    cmdMap:{},
    
    init: function(cb) {
        sails.log.debug(">>> Service.init()");
        
        // delete database entries
        /*
        Service.destroy({},function (err,theDeleted){
            if (err) {
                cb(err);
            }
            
            sails.log.debug('>>> Service records deleted, if there were any.',theDeleted);
            cb();
        });
        */
       
        // add test workflow
        /*
        var testWorkflowSvc = require('../../test/data/testWorkflowService');

        // test workflow add service
        var service = {
            name:   'test_workflow',
            type:   'workflow',
            module: 'test',
            handler: testWorkflowSvc                    
        };
        var p = Service.addService(service,function(result){
            //console.log("addService result typeof - ",typeof result);
            //console.log('addService result',result);
        });
       
       */
        // we must do a deferred action in init, so since we commented out the destroy...
        Service.find({},function(err,found) {
           cb(); 
        });
    },
    
    addService: function(service,cb) {
        
        var handler = service.handler;
        
        if (typeof service.name === 'undefined') {
            sails.log('addService - no service name');
            return cb('addService - no service name');
        } 
        if (typeof service.handler === 'undefined') {
            sails.log('addService - no handler defined',service.handler);
            return cb('addService - no handler defined');
        }
        
        sails.log.info('addService',service.name, service.type, service.module);
        
        Service.updateOrCreate({name:service.name},service).then(function(record) {
            sails.log('service added',service.name);
            _addService(handler,service.name);
            return cb();
        }).catch(function(err) {
            sails.log('error adding service',service.name);
            return cb(err);
        });
        
        function _addService(svc) {
            serviceProc.services[service.name] = service.handler;

            for(var cmd in handler.fmap) {
                if (typeof serviceProc.cmdMap[cmd] === 'undefined')
                    serviceProc.cmdMap[cmd] = service.name;
            }
        }
    },
    
    execute: function (req, res) {

        var serviceName = "***";
        
        //sails.log('service.execute',req.route);
        //sails.log('params',req.params,'body',req.body);
        
        // given the route /service/exec/mycmd, id will be 'mycmd', the command
        var cmdName = req.params['id'];
        
        // if it contains a ':', it is a long form command
        if (cmdName.indexOf(':') !== -1) {
            var x = cmdName.split(':');
            cmdName = x[0];
            serviceName = x[1];
        }
        else {
            // attempt to get service name from map
            serviceName = serviceProc.cmdMap[cmdName];
        }
        sails.log("service %s cmd %s",serviceName,cmdName, req.allParams());
        
        // does service exist or is it registered
        if (typeof this.services[serviceName] === 'undefined') {
            sails.log.error('service does not exist:',serviceName);
            return res.forbidden();
        }
        // determine type of request GET/POST, etc.  Reject invalid
        var method = req.method;
        method = method.toLowerCase();
        if (method !== this.services[serviceName].fmap[cmdName]) {
            sails.log.error('forbidden request method:',req.method,method,this.services[serviceName].fmap[cmdName]);
            return res.forbidden();
        }
        // is the command implemented
        if (typeof this.services[serviceName].fmap[cmdName] === 'undefined' || typeof this.services[serviceName][cmdName] !== 'function') {
            sails.log.error('invalid command:',cmdName);
            return res.forbidden();
        }
        this.services[serviceName][cmdName](req,res);
        
    }
};
