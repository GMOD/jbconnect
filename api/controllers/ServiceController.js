/**
 * @module
 * @ignore
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
    exec: serviceProc.execute
};

