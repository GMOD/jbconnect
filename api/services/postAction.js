/* 
    Created on : Nov 29, 2017, 7:27:05 PM
    Author     : Eric
*/

module.exports = {
    /**
     * Add track to track list and notify.
     * 
     * @param {object} kWorkflowJob
     * @param {JSON} newTrackJson
     */
    addToTrackList: function(kJob,newTrack) {
        sails.log("addToTrackList",newTrack);
        var g = sails.config.globals.jbrowse;

        var track = newTrack[0];

        var dataset = kJob.data.dataset.path;
        var trackname = track.label;

        Track.addTrack(dataset,track,function(err,added) {
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



