//const request = require('supertest');
//const session = require('supertest-session');

const chai = require('chai')
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('integration test', function(){
    it('login', function(done) {
        
        let app = sails.hooks.http.app;
        agent = chai.request.agent(app);

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
        
        //let app = sails.hooks.http.app;
        //agent = chai.request.agent(app);

        agent
          .post('/job/submit')
//          .set('content-type', 'application/json; charset=utf-8')
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
              console.log('/job/submit body',body);
              //console.log('/job/submit res',res);
              done();
          });
    });
    
});