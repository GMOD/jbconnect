/**
 * @module
 * @description
 * REST interfaces for UserController
 * 
 * **Subscribe to User events:**
 * ::
 *   io.socket.get('/user', function(resData, jwres) {console.log(resData);});
 *   io.socket.on('user', function(event){
 *      consol.log(event);
 *   }
 * 
 */

module.exports = {
    /**
     * Enumerate or search users
     * 
     * ``GET /user/get``
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

