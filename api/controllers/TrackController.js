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
     * ``GET /track/get``
     * 
     * Get filtered tracks by dataset:
     * 
     * ``GET /track/get?id=1`` where id is the dataset id
     * 
     * ``GET /track/get?path=sample_data/json/volvox`` where path is the dataset path
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    get: function(req,res) {
        var params = req.allParams();
        sails.log("/track/get",params);
        /* istanbul ignore else */
        if (req.method === 'GET') {
            Track.Get(params,function(err,records) {
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
    /**
     * add a new track
     * 
     * ``POST /track/add``
     * 
     * Must include "dataset" in the fields, which can be the path (string) or id (int)
     * 
     * Calling example:
     * ::
     *   let newTrack = {
     *       "dataset":"sample_data/json/volvox",
     *       "autocomplete": "all",
     *       "track": "EST",
     *       "style": {
     *           "className": "est"
     *       },
     *       "key": "HTMLFeatures - ESTs",
     *       "feature": [
     *           "EST_match:est"
     *       ],
     *       "storeClass": "JBrowse/Store/SeqFeature/NCList",
     *       "urlTemplate": "tracks/EST/{refseq}/trackData.json",
     *       "compress": 0,
     *       "label": "EST",
     *       "type": "FeatureTrack",
     *       "category": "Miscellaneous"
     *   };
     *   $.post( "/track/add", newTrack, function( data ) {
     *     console.log( "result", data );
     *   }, "json");
     *   
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    add: function(req,res) {
        var params = req.allParams();
        var track = params;
        //console.log("TrackController /track/add track",track);

        /* istanbul ignore else */
        if (req.method === 'POST') {
            /* istanbul ignore if */
            if (_.isUndefined(track.dataset)) 
                return res.serverError({err:"dataset property not defined",track:track});

            Track.Add(track,function(err,created) {
                //console.log('created',created);
                /* istanbul ignore next */
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
     * POST ``/track/modify``
     * 
     * Calling example:
     * ::
     *   let modifyTrack = {
     *       "autocomplete": "all",
     *       "track": "EST",
     *       "style": {
     *           "className": "est"
     *       },
     *       "key": "HTMLFeatures - ESTs",
     *       "feature": [
     *           "EST_match:est"
     *       ],
     *       "storeClass": "JBrowse/Store/SeqFeature/NCList",
     *       "urlTemplate": "tracks/EST/{refseq}/trackData.json",
     *       "compress": 0,
     *       "label": "EST",
     *       "type": "FeatureTrack",
     *       "category": "Miscellaneous"
     *   };
     *   $.post( "/track/modify", modifyTrack, function( data ) {
     *     console.log( "result", data );
     *   }, "json");
     *   
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    modify: function(req,res) {
        var params = req.allParams();
        var track = params;
        // istanbul ignore else
        if (req.method === 'POST') {
            Track.Modify(track,function(err,modified) {
                // istanbul ignore if
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
     * ``POST /track/remove``
     * 
     * Calling example:
     * ::
     *   $.post( "/track/remove", { id: 23 }, function( data ) {
     *     console.log( "result", data );
     *   }, "json");
     * 
     * @param {object} req - request
     * @param {object} res - response
     * 
     */
    remove: function(req,res) {
        let params = req.allParams();
        //let id = params.id;
        //let dataset = Dataset.Resolve(params.dataset);
        //let label = params.label;

        /* istanbul ignore else */
        if (req.method === 'POST') {
            Track.Remove(params,function(err) {
                /* istanbul ignore next */
                if (err) return res.serverError({err:err});
                return res.ok();
            });
        } 
        else 
            return res.forbidden('requires POST');
        
    }
};

