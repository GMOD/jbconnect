const tlib = require('../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('integration test', function(){
    this.timeout(25000);
    it('login', function(done) {
        
        //let app = sails.hooks.http.app;
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
    it('submit nothing burger', function(done) {
        
        agent
          .post('/job/submit')
          .send({
              'service': 'nothingBurgerService',
              'dataset':'sample_data/json/volvox'
          })
          .end((err,res,body) => {
                console.log('/job/submit status',res.status);
                expect(res).to.have.status(200);
                console.log('/job/submit body',res.body);
                let jobId = res.body.jobId;
                console.log("Job id=",jobId);
                
                tlib.waitForJobComplete(jobId,function(complete,data){
                    
                    expect(complete).to.equal(true);
                    expect(data.state).to.equal('complete','job completed');
                    
                    let trackLabel = data.data.track.label+"|1";
                    
                    //expect(trackLabel).to.equal("NOTHING_"+jobId);
                    
                    agent.get("/track/get?lkey="+trackLabel)
                      .set('content-type','application/json; charset=utf-8')
                      .end((err,res,body) => {
                          let trackData = res.body[0];
                          let trackLabelShould = 'NOTHING_'+jobId;
                          console.log("track data",trackData);
                          
                          expect(res).to.have.status(200,'/track/get status 200');
                          expect(trackData.trackData.nothing).to.equal(true,'the track nothing field must be true');
                          //expect(trackData.trackData.label).to.equal(trackLabelShould,'track label confirmed '+trackLabelShould);
                          //expect(trackData.lkey).to.equal(trackLabelShould,'track label confirmed '+trackLabelShould);

                          done();
                     });
                    
                });
          });
    });
    it('should call rest /service/exec/crazy_test', function(done) {
        agent
          .get('/service/exec/crazy_test')
          .set('content-type','application/json; charset=utf-8')
          .end((err,res,body) => {
                expect(res).to.have.status(200);
                assert.equal(_.isEmpty(res.body),false,"should not be empty");
                assert.equal(res.body.hi,'there',"verify return data");
                done();
          });
    });
    it('should call rest /service/exec/crazy_test:nothingBurgerService', function(done) {
        agent
          .get('/service/exec/crazy_test:nothingBurgerService')
          .set('content-type','application/json; charset=utf-8')
          .end((err,res,body) => {
                expect(res).to.have.status(200);
                assert.equal(_.isEmpty(res.body),false,"should not be empty");
                assert.equal(res.body.hi,'there',"verify return data");
                done();
          });
    });
});