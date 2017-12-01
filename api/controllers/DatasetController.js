/*
 * @module
 * @ignore
 * @description
 * DatasetController
 *
 * Server-side logic for managing Dataset
 * 
 * See http://sailsjs.org/#!/documentation/concepts/Controllers
 * 
 * ##excludedoc
 */

module.exports = {
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/dataset/get",params);
        if (req.method === 'GET') {
            Dataset.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    }
	
};

