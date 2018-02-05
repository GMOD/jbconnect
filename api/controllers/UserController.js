/*
 * @module
 * @description
 * UserController
 *
 * Server-side logic for managing users
 * 
 * See http://sailsjs.org/#!/documentation/concepts/Controllers
 * 
 */

module.exports = {
    /**
     * Read or search users
     * REST `/user/get`
     * 
     * @param {object} req
     * @param {object} res
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/user/get",params);
        if (req.method === 'GET') {
            User.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    }

};

