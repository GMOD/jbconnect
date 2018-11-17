const _ = require("lodash");
const tlib = require('../../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const fs = require('fs-extra');

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;
const asyncmod = require("async");

describe('Track Model', function() {

  it('login', function(done) {
        
    // this preserves session data for subsequent calls
    agent = chai.request.agent(server);

    agent
      .post('/auth/local?next=/jbrowse')
      .set('content-type', 'application/x-www-form-urlencoded; application/json; charset=utf-8')
      .send({
          'identifier':'juser',
          'password':'password',
          'submit':'login'
      })
      .type('form')
      .end((err,res,body) => {
            expect(res).to.have.status(200);
    
            agent
              .get('/loginstate')
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                 console.log('/loginstate body',res.body);
                 expect(res).to.have.status(200, '/loginstate status 200');
                 expect(res.body.loginstate).to.equal(true, 'login state true');
                 expect(res.body.user.username).to.equal('juser','login username is juser');

                 done();
              });
      });
  });
  it('should verify boostrap Track.Sync was successful', function(done) {
    // only test the first dataset    
    let dataset = Dataset.Resolve(1);

    Track.find({dataset:dataset.id})
    .then(function(results) {

      console.log('results',results);
      console.log('results.0',results[0].lkey);

      assert.isAbove(results.length,0,"results.length is > 0");

      let mtracks = {}, ftracks = {};
      for(var i in results) mtracks[results[i].lkey] = results[i].trackData;

      var g = sails.config.globals.jbrowse;
      var trackListPath = g.jbrowsePath + dataset.path + '/' + 'trackList.json';
      var trackListData = fs.readFileSync (trackListPath);
      var config = JSON.parse(trackListData);
      var tracks = config.tracks;
      assert.isAbove(tracks.length,0,"tracks.length > 0");

      for(i in tracks) ftracks[tracks[i].label+"|1"] = tracks[i];

      //for(i in mtracks) console.log("m",mtracks[i].label);  // debug
      //for(i in ftracks) console.log("f",mtracks[i].label);

      console.log("mtrack.length",Object.keys(mtracks).length);
      assert.equal(Object.keys(mtracks).length,Object.keys(ftracks).length,"length of countm and countf are equal");

      for(i in mtracks) assert.deepEqual(mtracks[i],ftracks[i],"objects are deep equal");

      done();
    })
    .catch(done);
  });

  describe('Track.find()', function() {
    it('should check find function', function (done) {
      Track.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });
  /*
  it('should call /track/add', function(done) {
        
    // this preserves session data for subsequent calls
    // agent = chai.request.agent(server);

    let dataset = Dataset.Resolve(1);

    let newTrack = {
        "dataset":dataset.id,
        "autocomplete": "all",
        "track": "EST",
        "style": {
            "className": "est"
        },
        "key": "HTMLFeatures - ESTs Test",
        "feature": [
            "EST_match:est"
        ],
        "storeClass": "JBrowse/Store/SeqFeature/NCList",
        "urlTemplate": "tracks/EST/{refseq}/trackData.json",
        "compress": 0,
        "label": "TestTrack1",
        "type": "FeatureTrack",
        "category": "JBConnectTest"
    };

    agent
      .post('/track/add')
      //.set('Content-Type', 'application/json; charset=utf-8')
      .send(newTrack)
      //.type('form')
      .end((err,res,body) => {
            //console.log('/track/add status',res.status);
            expect(res).to.have.status(200);
            //console.log("test /track/add",res.body,body);

            let theKey = res.body.lkey;
            let geturl = '/track/get?lkey='+theKey;

            agent
              .get(geturl)
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                 console.log('add track - /track/get verify',res.body);
                 expect(res).to.have.status(200, 'status 200');
                 assert.equal(res.body[0].lkey,theKey, 'verify');

                 // save global track for later (modify and remove test)
                 theNewTrack = res.body[0];  

                 done();
              });
      });
  });
  */
  /*
  it('should call /track/modify', function(done) {
        
    let dataset = Dataset.Resolve(1);
    agent
      .post('/track/modify')
      //.set('Content-Type', 'application/json; charset=utf-8')
      .send(newTrack)
      //.type('form')
      .end((err,res,body) => {
            //console.log('/track/add status',res.status);
            expect(res).to.have.status(200);
            //console.log("test /track/add",res.body,body);

            let theKey = res.body.lkey;
            let geturl = '/track/get?lkey='+theKey;

            agent
              .get(geturl)
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                 console.log('add track - /track/get verify',res.body);
                 expect(res).to.have.status(200, 'status 200');
                 assert.equal(res.body[0].lkey,theKey, 'verify');

                 done();
              });
      });
  });
  */
 /*
  it('should call /track/remove', function(done) {
        
    let dataset = Dataset.Resolve(1);
    agent
      .post('/track/remove')
      //.set('Content-Type', 'application/json; charset=utf-8')
      .send(theNewTrack)
      //.type('form')
      .end((err,res,body) => {
            expect(res).to.have.status(200);
            //console.log("test /track/add",res.body,body);

            let theKey = theNewTrack.lkey;
            let geturl = '/track/get?lkey='+theKey;

            agent
              .get(geturl)
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                 console.log('add track - /track/get verify',res.body);
                 expect(res).to.have.status(404, 'status 404 expected (not found because deleted)');
                 //assert.equal(res.body[0].lkey,theKey, 'verify');

                 done();
              });
      });
  });
*/
  it('should test Track.Sync', function(done) {
        
    // this preserves session data for subsequent calls
    // agent = chai.request.agent(server);

    let dataset = Dataset.Resolve(1);

    let newTrack = {
        "dataset":dataset.id,
        "autocomplete": "all",
        "track": "EST",
        "key": "",
        "storeClass": "JBrowse/Store/SeqFeature/NCList",
        "urlTemplate": "tracks/EST/{refseq}/trackData.json",
        "compress": 0,
        "label": "TestTrack1",
        "type": "FeatureTrack",
        "category": "JBConnectTest"
    };
    done();
    /*
    Track.dbAdd(newTrack);

    agent
      .post('/track/add')
      //.set('Content-Type', 'application/json; charset=utf-8')
      .send(newTrack)
      //.type('form')
      .end((err,res,body) => {
            //console.log('/track/add status',res.status);
            expect(res).to.have.status(200);
            //console.log("test /track/add",res.body,body);

            let theKey = res.body.lkey;
            let geturl = '/track/get?lkey='+theKey;

            agent
              .get(geturl)
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                 console.log('add track - /track/get verify',res.body);
                 expect(res).to.have.status(200, 'status 200');
                 assert.equal(res.body[0].lkey,theKey, 'verify');

                 // save global track for later (modify and remove test)
                 theNewTrack = res.body[0];  

                 done();
              });
      });
*/
    });

});
