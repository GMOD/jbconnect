/**
 * @module
 * @description
 * REST interfaces for JobActive model.
 * 
 * See: JobActive model.
 * 
 * **Subscribe to JobActive events:**
 * ::
 *   io.socket.get('/jobactive', function(resData, jwres) {console.log(resData);});
 *   io.socket.on('jobactive', function(event){
 *      consol.log(event);
 *   }
 *   
*/


module.exports = {
    /**
     * Read job active record
     * 
     * ``GET /jobactive/get``
     * 
     * @param {object} req - request
     * @param {object} res - response
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/jobactive/get",params);
        /* istanbul ignore else */
        if (req.method === 'GET') {
            JobActive.Get(params,function(err,records) {
                /* istanbul ignore next */
                if (err) res.serverError(err);
                /* istanbul ignore next */
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
	
};
