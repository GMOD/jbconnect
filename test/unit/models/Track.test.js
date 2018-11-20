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

  let org_mlen = 0;
  let org_flen = 0;

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

  describe('verify boostrap Track.Sync was successful', function() {
    it('should verify boostrap Track.Sync was successful', function(done) {
      // only test the first dataset    
      let dataset = Dataset.Resolve(1);

      read_db_and_f(dataset.path,function(t) {

        //var i;
        //for(i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
        //for(i in t.ftracks) console.log("f",t.mtracks[i].label);

        //console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);

        assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
        assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
        assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"length of countm and countf are equal");

        // save original lengths for future tests
        org_mlen = Object.keys(t.mtracks).length;
        org_flen = Object.keys(t.ftracks).length;

        for(var i in t.mtracks) assert.deepEqual(t.mtracks[i],t.ftracks[i],"objects are deep equal");
    
        done();
      });

    });
  });


  describe('test Track.Sync after adding new db items', function() {
    it('should test Track.Sync after adding new db items', function(done) {
      // only test the first dataset    
      let dataset = Dataset.Resolve(1);

      let cr1,cr2;

      let t1 = {
        "dataset":dataset.id,
        "path": dataset.path,
        "lkey": "test1|"+dataset.id,
        "trackData": {
          "label": "test1",
          "key": "test1",
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest"
        }
      };
      let t2 = {
        "dataset":dataset.id,
        "path": dataset.path,
        "lkey": "test2|"+dataset.id,
        "trackData": {
          "label": "test2",
          "key": "test2",
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest"
        }
      };

      Track.create(t1)
      .then(function(created){
          cr1 = created;
          return Track.create(t2);
      })
      .then(function(created) {
          cr2 = created;

          read_db_and_f(dataset.path,function(t) {

            for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
            for(i in t.ftracks) console.log("f",t.ftracks[i].label);
      
            console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
      
            assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
            assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
            assert.equal(Object.keys(t.mtracks).length,2+Object.keys(t.ftracks).length,"mcount = 2+fcount");
        
            Track.Sync(dataset.id);

            setTimeout(function(){

              read_db_and_f(dataset.path,function(t) {

                console.log('post sync');
                for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
                for(i in t.ftracks) console.log("f",t.mtracks[i].label);
          
                console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
          
                assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
                assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
                assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"mcount = 2+fcount");
      
                done();
              });
            },1000);
          }); //read
      }); //then
    });
  });  

  
  describe('verify trackcounts should be original value', function() {
    it('should verify boostrap Track.Sync was successful', function(done) {
      // only test the first dataset    
      let dataset = Dataset.Resolve(1);

      read_db_and_f(dataset.path,function(t) {

        //var i;
        //for(i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
        //for(i in t.ftracks) console.log("f",t.mtracks[i].label);

        //console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);

        assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
        assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
        assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"length of countm and countf are equal");

        // save original lengths for future tests
        assert.equal(org_mlen,Object.keys(t.mtracks).length);
        assert.equal(org_flen,Object.keys(t.ftracks).length);
        assert.equal(org_mlen,org_flen);

        for(var i in t.mtracks) assert.deepEqual(t.mtracks[i],t.ftracks[i],"objects are deep equal");
    
        done();
      });

    });
  });


  describe('test Track.Sync after adding new file items', function() {
    it('should test Track.Sync after adding new db items', function(done) {
      // only test the first dataset    
      let ds = Dataset.Resolve(1);

      let cr1,cr2;

      let t1 = {
          "label": "test3",
          "key": "test3",
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest"
      };
      let t2 = {
          "label": "test4",
          "key": "test4",
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest"
      };

      var g = sails.config.globals.jbrowse;
      var trackListPath = g.jbrowsePath + ds.path + '/' + 'trackList.json';
      var trackListData = fs.readFileSync (trackListPath);
      var config = JSON.parse(trackListData);
      var tracks = config.tracks;

      let tracks_a = {};
      for(var i in tracks) tracks_a[tracks[i].label] = tracks[i];

      assert.isUndefined(tracks_a[t1.label],t1.label+" already exists in trackList.json");
      if (_.isUndefined(tracks_a[t1.label])) tracks.push(t1);

      assert.isUndefined(tracks_a[t2.label],t2.label+" already exists in trackList.json");
      if (_.isUndefined(tracks_a[t2.label])) tracks.push(t2);

      fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
      

      read_db_and_f(ds.path,function(t) {

        for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
        for(i in t.ftracks) console.log("f",t.ftracks[i].label);
  
        console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
  
        assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
        assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
        assert.equal(2+Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"fcount = 2 + mcount");
    
        Track.Sync(ds.id);

        setTimeout(function(){

          read_db_and_f(ds.path,function(t) {

            console.log('post sync');
            for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
            for(i in t.ftracks) console.log("f",t.mtracks[i].label);
      
            console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
      
            assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
            assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
            assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"mcount = 2+fcount");
            assert.equal(org_mlen+2,Object.keys(t.mtracks).length, "should indicate we added 2 tracks");

            done();
          });
        },1000);
      }); //read
    });
  });  

  
  describe('test Track.Sync after modifying a file track', function() {
    it('should test Track.Sync after modifying file track', function(done) {
      // only test the first dataset    
      let ds = Dataset.Resolve(1);

      let cr1,cr2;

      var g = sails.config.globals.jbrowse;
      var trackListPath = g.jbrowsePath + ds.path + '/' + 'trackList.json';
      var trackListData = fs.readFileSync (trackListPath);
      var config = JSON.parse(trackListData);
      var tracks = config.tracks;

      let tracks_a = {};
      for(var i in tracks) tracks_a[tracks[i].label] = tracks[i];

      // modify track test3
      tracks_a["test3"].key = "test3 modified";

      fs.writeFileSync(trackListPath,JSON.stringify(config,null,4));
      

    
      Track.Sync(ds.id);

      setTimeout(function(){

        read_db_and_f(ds.path,function(t) {

          console.log('post sync');
          for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
          for(i in t.ftracks) console.log("f",t.mtracks[i].label);
    
          console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
    
          assert.equal(t.mtracks["test3|1"].key,"test3 modified", "verify track is modified in db");

          assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
          assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
          assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"mcount = 2+fcount");
          assert.equal(org_mlen+2,Object.keys(t.mtracks).length, "should indicate we added 2 tracks");

          done();
        });
      },1000);
    });
  });  


  describe(' call /track/add', function() {
    it('should call /track/add', function(done) {
          
      let ds = Dataset.Resolve(1);
      let t1 = {
          "dataset":ds.id,
          "label": "test5",
          "key": "test5",
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest"
      };

      agent
        .post('/track/add')
        .send(t1)
        .end((err,res,body) => {
              expect(res).to.have.status(200);

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

                  read_db_and_f(ds.path,function(t) {

                    console.log('post sync');
                    for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
                    for(i in t.ftracks) console.log("f",t.mtracks[i].label);
              
                    console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
              
                    assert.isAbove(Object.keys(t.mtracks).length,0,"model tracks > 0");
                    assert.isAbove(Object.keys(t.ftracks).length,0,"file tracks > 0");
                    assert.equal(Object.keys(t.mtracks).length,Object.keys(t.ftracks).length,"mcount = 2+fcount");
                    assert.equal(org_mlen+3,Object.keys(t.mtracks).length, "should indicate we added 2 tracks");
          
                    done();
                  });
        
                });
        });
    });
  });


  describe('test /track/remove & Track.Remove', function() {
    it('should call /track/remove', function(done) {
          
      let dataset = Dataset.Resolve(1);

      Track.findOne({lkey: "test4|1"}).exec(function(err,found) {
        console.log("track remove findeOne",found);
        assert.exists(found, "track4 track found");
        assert.equal(found.trackData.label,"test4");
      
        let id = found.id;

        agent
        .post('/track/remove')
        //.set('Content-Type', 'application/json; charset=utf-8')
        .send({id:id,dataset:dataset.path})
        //.type('form')
        .end((err,res,body) => {
              expect(res).to.have.status(200);
              console.log("post /track/remove",res.body,body);

              let theKey = found.lkey;
              let geturl = '/track/get?lkey='+theKey;

              agent
                .get(geturl)
                .set('content-type','application/json; charset=utf-8')
                .end((err,res,body) => {
                  console.log('track remove - /track/get verify',res.body);
                  expect(res).to.have.status(404, 'status 404 expected (not found because deleted)');

                  done();
                });
        });

      });

    });
  });

  
  describe('test /track/modify & Track.Modify', function() {
    it('should call /track/modify', function(done) {
          
      let dataset = Dataset.Resolve(1);
      let ds = Dataset.Resolve(1);

      let teststr1 = "best modified ho";
      let teststr2 = "best things for last";

      let t1 = {
          "dataset":ds.id,
          "label": "test5",
          "key": teststr1,
          "storeClass": "JBrowse/Store/SeqFeature/NCList",
          "urlTemplate": "tracks/EST/{refseq}/trackData.json",
          "type": "FeatureTrack",
          "category": "JBConnectTest",
          "stuff":teststr2
      };

      agent
        .post('/track/modify')
        .send(t1)
        .end((err,res,body) => {
              expect(res).to.have.status(200);
              console.log("results /track/modify",res.body,body);

              read_db_and_f(ds.path,function(t) {

                //console.log('post sync');
                //for(var i in t.mtracks) console.log("m",t.mtracks[i].label);  // debug
                //for(i in t.ftracks) console.log("f",t.mtracks[i].label);

                let lkey = "test5|1"

                console.log("count",Object.keys(t.mtracks).length,Object.keys(t.ftracks).length);
          
                assert.equal(Object.keys(t.ftracks).length,Object.keys(t.mtracks).length, "mcount and fcount is equal");
                assert.equal(t.mtracks[lkey].key,teststr1, "verify m teststr1");
                assert.equal(t.mtracks[lkey].stuff,teststr2, "verify m teststr2");
                assert.equal(t.ftracks[lkey].key,teststr1, "verify f teststr1");
                assert.equal(t.ftracks[lkey].stuff,teststr2, "verify f teststr2");

                done();
              });
        });
    });
  });


  function read_db_and_f(ds,done) {
    console.log('read_db_and_f');
    let t = {
      ftracks: {},
      mtracks: {}
    }
    Track.find({path:ds})
    .then(function(results) {

      for(var i in results) t.mtracks[results[i].lkey] = results[i].trackData;

      var g = sails.config.globals.jbrowse;
      var trackListPath = g.jbrowsePath + ds + '/' + 'trackList.json';
      var trackListData = fs.readFileSync (trackListPath);
      var config = JSON.parse(trackListData);
      var tracks = config.tracks;

      for(i in tracks) t.ftracks[tracks[i].label+"|1"] = tracks[i];
      done(t);
    })
    .catch(function(err) {
      console.log("read_db_and_f",err);
    });
  }
});
