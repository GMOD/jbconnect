/*
 * @module
 * @ignore
 * @description
 * Server-side logic for managing jbtracks

 * See http://sailsjs.org/#!/documentation/concepts/Controllers
 * 
 * ##excludedoc
 */

module.exports = {
    /**
     * 
     * @param {object} req
     * @param {object} res
     * @returns {unresolved}
     */
    addTrack: function(req,res) {
        var params = req.allParams();
        var track = params.track;
        if (req.method === 'POST') {
            Track.addTrack(track,function(err,created) {
                if (err) return res.serverError({err:err,track:track});
                return res.ok(created);
            });
        } 
        else 
            return res.forbidden('requires POST');
    },
    modifyTrack: function(req,res) {
        var params = req.allParams();
        var track = params.track;
        if (req.method === 'POST') {
            Track.modifyTrack(track,function(err,modified) {
                if (err) return res.serverError({err:err,track:track});
                return res.ok(modified);
            });
        } 
        else 
            return res.forbidden('requires POST');
        
    },
    removeTrack: function(req,res) {
        var params = req.allParams();
        var id = params.trackId;
        if (req.method === 'POST') {
            Track.destroyTrack(id,function(err) {
                if (err) return res.serverError({err:err});
                return res.ok();
            });
        } 
        else 
            return res.forbidden('requires POST');
        
    }
};

