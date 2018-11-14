/** 
 * @module
 * @description
 * 
 * Used by hooks to add a track and announce to subscribers.
*/

module.exports = {
    /**
     * Add track to track list and notify.
     * 
     * @param {object} kJob - kue job reference
     * @param {JSON} newTrackJson - new track JSON
     * 
     */
    addToTrackList: function(kJob,newTrack) {
        //sails.log("addToTrackList",newTrack);
        var g = sails.config.globals.jbrowse;

        var track = newTrack[0];

        var dataset = kJob.data.dataset;
        var trackname = track.label;

        track.dataset = dataset;

        Track.Add(track,function(err,added) {
            /* istanbul ignore if */
            if (err) {
                sails.log('failed to add track',trackname);
                return kJob.kDoneFn(new Error("failed to add track"));
            }
            var track = added.trackData;

            //sails.log ("Old Announced new track ",track.label);
            //sails.hooks['jbcore'].sendEvent("track-new",track);

            kJob.progress(100,100);

            kJob.kDoneFn();                                                 // kue workflow completed successfully
        });
    }
};



