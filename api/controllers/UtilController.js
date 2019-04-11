/*
Utility interfaces
*/
/* istanbul ignore file */
const _ = require('lodash');
const async = require('async');

module.exports = {
	/*
	 * cleanup demo datablase and tracks in demo
	 * req/res are express-based.
	 */
	demoCleanup: function(req, res) {
		console.log("demoCleanup");
		if (req.method === 'POST') {

			sails.log.info("********** demo cleanup *********************");

			let nJobs = 0;
			let nTracks = 0;
			let simulate = false;  // for debug.  if true, won't actually delete anything.

			if (simulate) sails.log.info("democleanup simulate");

			_deleteJobs(function(err) {
				_deleteTracks(function(err) {
					return res.ok({tracks:nTracks,jobs:nJobs});
				});
			});
			
			function _deleteJobs(next) {
				sails.log.info("deleting jobs");
				Job.find({})
				.catch(function(err) {
					console.log("Job.find failed");
				})
				.then(function(records) {
					if (records && records.length > 0) {
						
						let deleteRecs = [];
						
						for(var i in records ) {
							if (!_.isUndefined(records[i].keep)) continue;
							
							deleteRecs.push(records[i]);
						}
						if (deleteRecs.length) {
						
							deleteRecs.forEach(function(rec) {
								sails.log.info("will remove job",rec.id,rec.data.name);
							});

							/*
							let count = deleteRecs.length - 7;
							deleteRecs2 = [];
							for(let i=0;i < count;i++) deleteRecs2.push(deleteRecs[i]);
							
							deleteRecs2.forEach(function(rec) {
								sails.log.info("selected to remove",rec.id,rec.data.name);
							});

							deleteRecs = deleteRecs2;
							*/

							if (!simulate) {
								async.eachLimit(deleteRecs,1,
									function(rec,cb){
										Job.Remove(rec,function(err,id) {
											if (err) {
												sails.log.error("failed to remove",rec.id,rec.data.name,err);
												return cb(err);
											}
											sails.log.info("removed job",rec.id,rec.data.name);
											return cb();
										});
									},
									function(err){
										// all done
										return next();
									}
								);
							}
							else 
								return next();
						}
						else {
							sails.log.warn("no jobs to delete");
							return next();
						}
					}
					else {
						sails.log.warn("no jobs detected");
						return next();
					}
				});
			}
			function _deleteTracks(next) {
				sails.log.info("deleting tracks");
				Track.find({})
				.catch(function(err) {
					return next(err);
				})
				.then(function(records) {
					if (records && records.length > 0) {
						
						let deleteRecs = [];
						
						for(var i in records ) {
							if (!_.isUndefined(records[i].trackData.keep)) continue;

							if ( !_.isUndefined(records[i].trackData.category) && records[i].trackData.category==="JBlast Results" ) {
								deleteRecs.push(records[i]);
							}
						}
						if (deleteRecs.length) {
							
							deleteRecs.forEach(function(rec) {
								sails.log.info("will remove track",rec.lkey);
							});
							
							if (!simulate) {
								async.eachLimit(deleteRecs,1,
									function(rec,cb){
										Track.Remove(rec,function(err,id) {
											if (err) {
												sails.log.error("failed to remove",err);
												return cb(err);
											}
											sails.log.info("removed track",rec.lkey);
											return cb();
										});
									},
									function(err){
										// all done
										return next();
									}
								);
							}
							else return next();
						}
						else {
							sails.log.warn(deleteRecs.length,"tracks. no tracks to delete");
							return next();
						}
					}
					else {
						sails.log.warn("no tracks detected");
						return next();
					}
				});
			}
        } 
        else 
            return res.forbidden('requires POST');

	}
};
