/*
Utility interfaces
*/
/* istanbul ignore file */
const _ = require('lodash');
const async = require('async');
const fs = require('fs-extra');
const approot = require("app-root-path");
const jblib = require(approot+"/api/services/jbutillib");

module.exports = {
	/** 
	 * cleanup demo jobs and tracks
	 * requires login
	 * 
	 * Jobs that have the property keep:true will not be removed
	 * Tracks that have the property keep:true will not be removed. 
	 * Only tracks that belong to the category "JBlast Results" will be affected.
	 * 
	 * utils/jb_democleanup.js will execute this.
	 * jbutil --dbreset does not call this. --dbreset does a deeper reset of the entire database.
	 * 
	 * ``POST /democleanup``
	 * 
	 * req/res are express-based.
	 */
	demoCleanup: function(req,res) {
		let thisb = this;

		if (req.method != 'POST')
			res.forbidden("requires POST");

		let params = req.allParams();
		params.session = req.session;
		(async () => {
		
			await thisb.cleanJobs(params);
			await thisb.cleanTracks(params);
			res.ok("cleaned");			// all of the script.... 
		
		})();		
	},
	
	cleanJobs: async function(params) {
		
		let user = User.GetUserLogin(params);
		if (!user) {
			sails.log.error('cleanJobs - user not defined');
			return Promise.resolve(false);	// failed
		}
		let jobs = await Job.find({});

		for(var i in jobs) {
			if (jobs[i].data.user === user) {
				console.log('removing job',jobs[i].id,jobs[i].data.name,'('+jobs[i].data.user+')');
				let p = {id: jobs[i].id};
				await _remove(p);
			}
		}
		function _remove(params) {
			return new Promise(resolve => {
				Job.Remove(params,response => resolve(response));
			});
		}
	},

	cleanTracks: async function(params) {
		let user = User.GetUserLogin(params);
		let dataset = params.dataset;

		if (!dataset) {
			sails.log.error('cleanTracks - dataset not specified');
			return Promise.resolve(false); 	// failed
		}
		if (!Dataset.Resolve(dataset)) {
			sails.log.error('cleanTracks - dataset not available:',dataset);
			return Promise.resolve(false);	// failed
		}
		if (!user) {
			sails.log.error('cleanTracks - user not defined');
			return Promise.resolve(false);	// failed
		}

		let tracks = await Track.find({});
		
		for(var i in tracks) {
			if (Dataset.Resolve(tracks[i].dataset).path === dataset && tracks[i].trackData.user === user) {
				console.log('removing track',tracks[i].id,tracks[i].trackData.key,'|',Dataset.Resolve(tracks[i].dataset).path,'('+tracks[i].trackData.user+')');
				let p = {dataset: tracks[i].dataset, id: tracks[i].id};
				await _remove(p);
			}
		}

		function _remove(params) {
			return new Promise(resolve => {
				Track.Remove(params,response => resolve(response));
			});
		}
	},
	/*
	cleanTracks: async function(params) {
        const g = sails.config.globals.jbrowse;
		let user = User.GetUserLogin(params);
		let dataset = params.dataset;
		
		dataset = "sample_data/json/volvox";
		
		if (!user) {
			sails.log.error('cleanTracks - user not defined');
			return Promise.resolve(false);	// failed
		}
		if (!dataset) {
			sails.log.error('cleanTracks - dataset not defined');
			return Promise.resolve(false); 	// failed
		}

		let trackListPath = g.jbrowsePath + dataset + '/'+g.trackListFile;
		let trackjson = JSON.parse(fs.readFileSync(trackListPath,"utf8"));
		let tracks = trackjson.tracks;
		let filteredTracks = [];

		//sails.log.info('tracks',tracks.length,tracks);

		for(var k in tracks) {
			if (tracks[k].keep) continue;
			if (tracks[k].JBConnect && tracks[k].user === user) {
				console.log ('cleaning track',tracks[k].key);
				filteredTracks.push(tracks[k]);
			}
		}
		trackjson.tracks = filteredTracks;
		//fs.writeFileSync(trackListPath,trackjson);

		return await sync();
		
		function sync() {
			return new Promise(resolve => {
				//Track.Sync(response => resolve(response));
				Track.SyncTest(response => resolve(response));
			});
		}
	},
	*/
	testfn: function(req,res) {
        const g = sails.config.globals.jbrowse;
		let params = req.allParams();
		params.session = req.session;
		console.log('testfn',params);
		console.log("getMergedConfig",jblib.getMergedConfig());
		console.log("globals",g);
		(async () => {
			let v = await this.cleanTracks(params);
		
			res.ok(v);			// all of the script.... 
		
		})();		
	}
};
