/**
 * @module
 * @description
 * REST interfaces for TrackController
 * 
 * **Subscribe to Track events:**
 * ::
 *   io.socket.get('/track', function(resData, jwres) {console.log(resData);});
 *   io.socket.on('track', function(event){
 *      consol.log(event);
 *   }
 * 
 */

module.exports = {
    /**
     * enumerate tracks or search track list.
     * 
     * Get all tracks
     * :bash:`GET /track/get`
     * 
     * Get filtered tracks by dataset:
     * 
     * :bash:`GET /track/get?id=1` where id is the dataset id
     * 
     * :bash:`GET /track/get?pat=sample_data/json/volvox` where path is the dataset path
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/track/get",params);
        if (req.method === 'GET') {
            Track.Get(params,function(err,records) {
                if (err) res.serverError(err);
                if (records.length===0) return res.notFound();
                return res.ok(records);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
    /**
     * add a new track
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    add: function(req,res) {
        var params = req.allParams();
        var track = params.track;
        if (req.method === 'POST') {
            Track.Add(track,function(err,created) {
                if (err) return res.serverError({err:err,track:track});
                return res.ok(created);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
    /**
     * modify an existing track
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    modify: function(req,res) {
        var params = req.allParams();
        var track = params.track;
        if (req.method === 'POST') {
            Track.Modify(track,function(err,modified) {
                if (err) return res.serverError({err:err,track:track});
                return res.ok(modified);
            });
        } 
        else 
            return res.forbidden('requires POST');
        
    },
    /**
     * remove an existing track
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    remove: function(req,res) {
        var params = req.allParams();
        var id = params.trackId;
        if (req.method === 'POST') {
            Track.Remove(id,function(err) {
                if (err) return res.serverError({err:err});
                return res.ok();
            });
        } 
        else 
            return res.forbidden('requires POST');
        
    }
};

