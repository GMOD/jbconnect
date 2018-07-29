const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('integration test', function(){
    this.timeout(25000);
    it('login', function(done) {
        
        let app = sails.hooks.http.app;
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
                console.log('/service/get status',res.status);
                //console.log('login response',res);
                //console.log('session id',res.sessionID);
                expect(res).to.have.status(200);
                if (err) {
                  console.log('login error',err);
                  return done(err);
                }
                agent
                  .get('/loginstate')
                  .set('content-type','application/json; charset=utf-8')
                  .end((err,res,body) => {
                     console.log('/service/get status',res.status);
                     //console.log('/loginstate response',res);
                     console.log('/loginstate body',res.body);
                     expect(res).to.have.status(200);

                     if (err) {
                        console.log('/loginstate error',err);
                        return done(err);
                     }
                     done();
                  });
              //done();
          });
    });
    it('submit nothing burger', function(done) {
        
        //this.timeout(25000);
        console.log("Timeout for this test: 25sec");

        agent
          .post('/job/submit')
          .send({
              'service': 'nothingBurgerService',
              'dataset':'sample_data/json/volvox'
          })
          .end((err,res,body) => {
                console.log('/job/submit status',res.status);
                expect(res).to.have.status(200);
                if (err) {
                  console.log('login error',err);
                  return done(err);
                }
                console.log('/job/submit body',res.body);
                let ret = res.body;
                console.log("Job id=",ret.jobId);
                waitForJobComplete(ret.jobId,function(complete,err){
                    done();
                });
                setTimeout(done,20000);
          });
          function waitForJobComplete(jobId,complete) {
              
            let loop = setInterval(function() {
                agent.get("/job/get?id="+jobId)
                  .set('content-type','application/json; charset=utf-8')
                  .end((err,res,body) => {
                      if (err) 
                         return complete(0,err);
                      
                      console.log(res.body);
                      var job = res.body;
                      if (job[0].id !== jobId)
                          return complete(0,"job "+jobId+" does not exist");
                     
                      if (job[0].state === "complete"){
                          clearInterval(loop);
                          return complete(true);
                      }
                      else if (job[0].state === "error"){
                          clearInterval(loop);
                          console.log("*** job completed in error");
                          return complete(0,"job completed in error");
                      }
                  });
            },3000);
          }
    });
    
});