/*
 * @module
 * @description
 * JobActive is a single record model that contains a count of the active jobs
 * in the job queue.
 */


module.exports = {
    /**
     * 
     * @param {object} req
     * @param {object} res
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/jobactive/get",params);
        if (req.method === 'GET') {
            JobActive.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
	
};
