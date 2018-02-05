/*
 * @module
 * @description
 */

module.exports = {
    /**
     * Read or search datasets
     * 
     * @param {object} req
     * @param {object} res
     */
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

