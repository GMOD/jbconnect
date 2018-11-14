const _ = require("lodash");
const tlib = require('../../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

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

                 // save global track id for later (modify and remove test)
                 theTrackId = res.body[0].id;  

                 done();
              });
      });
  });
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
  it('should call /track/remove', function(done) {
        
    let dataset = Dataset.Resolve(1);
    agent
      .post('/track/remove')
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
});
