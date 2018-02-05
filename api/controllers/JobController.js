/*
 * @module
 * @description
 * JobController
 *
 * Server-side logic for managing Job
 * 
 * See http://sailsjs.org/#!/documentation/concepts/Controllers
 * 
 */

module.exports = {
    /**
     * Read or search job list.
     * @param {object} req
     * @param {object} res
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/job/get",params);
        if (req.method === 'GET') {
            Job.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
    /**
     * Submit a job.
     * @param {object} req
     * @param {object} res
     */
    submit: function(req,res) {
        var params = req.allParams();
        sails.log("/job/submit",params);
        if (req.method === 'POST') {
            Job.Submit(params,function(err,result) {
                if (err) res.serverError(err);
                return res.ok(result);
            });
        } 
        else 
            return res.forbidden('requires POST');
    }
	
};



