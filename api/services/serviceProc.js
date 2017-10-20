/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    
    /*
     * associative array of services, keyed by service name
     * service element:
     * {
     *    
     * }
     */
    services: {},
    
    init: function(cb) {
        sails.log.debug(">>> Service.init()");
        
        // delete database entries
        Service.destroy({},function (err,theDeleted){
            if (err) {
                cb(err);
            }
            
            sails.log.debug('>>> Service records deleted, if there were any.',theDeleted);
            cb();
        });
    },
    
    addService: function(service,cb) {
        
        var handler = service.handler;
        delete service[service.name];
        
        sails.log.debug('addService',service);
        
        Service.create( service,function(err, theService){
            
            sails.log.debug('post find create',err,theService);
            sails.log.info('Add Service:',theService.name,theService.type,'(',theService.module,')');
            
            serviceProc.services[theService.name] = handler;
            cb(err);
        });
    },
    
    enumServices: function (req, res) {
        sails.log.debug("enumServices()");
    },
    
    execute: function (req, res) {
        
    }
};
