/**
 * @module
 * @description
 * REST interfaces for Job model
 *
 * See Job model.
 * 
 * **Subscribe to Job events:**
 * ::
 *   io.socket.get('/job', function(resData, jwres) {console.log(resData);});
 *   io.socket.on('job', function(event){
 *      consol.log(event);
 *   }
 * 
 */

module.exports = {
    /**
     * Enumerate or search job list.
     * 
     * ``GET /job/get``
     * 
     * Example usage (jQuery): 
     * :: 
     *   $.ajax({
     *       url: "/job/get",
     *       dataType: "text",
     *       success: function (data) {
     *          console.log(data)
     *       }
     *   });
     * 
     * The returned ``data`` is a JSON array of *job* objects.
     * 
     * **Example Job object:**
     * ::
     *   {
     *       "id": 113,
     *       "type": "workflow",
     *       "progress": "100",
     *       "priority": 0,
     *       "data": {
     *         "service": "serverSearchService",
     *         "dataset": "sample_data/json/volvox",
     *         "searchParams": {
     *           "expr": "ttt",
     *           "regex": "false",
     *           "caseIgnore": "true",
     *           "translate": "false",
     *           "fwdStrand": "true",
     *           "revStrand": "true",
     *           "maxLen": "100"
     *         },
     *         "name": "ttt search",
     *         "asset": "113_search_1513478281528",
     *         "path": "/var/www/html/jbconnect/node_modules/jbrowse/sample_data/json/volvox/ServerSearch",
     *         "outfile": "113_search_1513478281528.gff",
     *         "track": {
     *           "maxFeatureScreenDensity": 16,
     *           "style": {
     *             "showLabels": false
     *           },
     *           "displayMode": "normal",
     *           "storeClass": "JBrowse/Store/SeqFeature/GFF3",
     *           "type": "JBrowse/View/Track/HTMLFeatures",
     *           "metadata": {
     *             "description": "Search result job: 113"
     *           },
     *           "category": "Search Results",
     *           "key": "113 ttt results",
     *           "label": "113_search_1513478281528",
     *           "urlTemplate": "ServerSearch/113_search_1513478281528.gff",
     *           "sequenceSearch": true
     *         }
     *       },
     *       "state": "complete",
     *       "promote_at": "1513478280038",
     *       "created_at": "1513478280038",
     *       "updated_at": "1513478292634",
     *       "createdAt": "2018-02-01T05:38:27.371Z",
     *       "updatedAt": "2018-02-01T05:38:27.371Z"
     *     }
     *   
     * @param {object} req - request
     * @param {object} res - response
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
     * 
     * **Example - submit sequence search:**
     * ::
     *   var postData = {
     *       service: "serverSearchService",
     *       dataset: "sample_data/json/volvox,
     *       searchParams: searchParams
     *   };
     *   $.post("/job/submit, postData, function(retdata) {
     *      console.log(retdata)
     *   },'json');
     * 
     * Returned data from job submit: ``{ status: "success", jobId: 152 }``, where
     * ``jobId`` is the id of the created job in the job queue.
     *    
     * @param {object} req - request
     * @param {object} res - response
     * 
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



