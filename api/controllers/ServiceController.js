/**
 * @module
 * @description
 * todo: document 
 */

module.exports = {
    
    // overrides settings in config/blueprints.js
    /*
    _config: {
      actions: true,
      shortcuts: true,
      rest: true
    },
    */
    /**
     * Read or search service list 
     * 
     * REST `/service/get`
     * 
     * @param {object} req
     * @param {object} res
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/service/get",params);
        if (req.method === 'GET') {
            Service.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
    /**
     * RESTful execution of a function of an jservice.
     * 
     * REST `/service/exec/...`
     * 
     * @param {type} req
     * @param {type} res
     */
    exec: serviceProc.execute
};

