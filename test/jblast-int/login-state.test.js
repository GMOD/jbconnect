const request = require('supertest');
//const fetch = require('node-fetch');

const chai = require('chai')
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const server = 'http://localhost:1337';
//const agent = chai.request.agent(server);
const expect = chai.expect;
const assert = chai.assert;

describe('some test', function(){
    //let sails = global.sails;
    
//    it('/loginstate before', function(done) {
//        agent
//          .get('/loginstate')
//          .set('content-type','application/json; charset=utf-8')
//          .end((err,res,body) => {
//             console.log('/service/get status',res.status);
//             console.log('/loginstate response',res);
//             console.log('/loginstate body',res.body);
//             expect(res).to.have.status(200);
//     
//             if (err) {
//                console.log('/loginstate error',err);
//                return done(err);
//             }
//             done();
//          });
//    });
    it('login', function(done) {
        
        let app = sails.hooks.http.app;
        agent = chai.request.agent(app);

        console.log('agent before login',agent);

        agent
          .post('/auth/local?next=/jbrowse')
//          .send('identifier=juser&password=password&submit=login')
          .set('content-type', 'application/x-www-form-urlencoded; application/json; charset=ucf-8')
          .send({
              'identifier': 'juser',
              'password':'password',
              'submit':'login'
          })
//          .type('form')
          .end((err,res,body) => {
              console.log('/service/get status',res.status);
              //console.log('login response',res);
              console.log('session id',res.sessionID);
              expect(res).to.have.status(200);
              if (err) {
                console.log('login error',err);
                return done(err);
              }
              done();
          });
    });
    it('/loginstate after', function(done) {
        //let app = sails.hooks.http.app;
        //let agent = chai.request.agent(app);
        console.log('agent after login',agent);
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
    });
//    it('/service/get', function(done) {
//        let app = sails.hooks.http.app;
//        let agent = chai.request.agent(app);
//        agent
//          .get('/service/get')
//          .set('content-type','application/json; charset=utf-8')
//          .end((err,res,body) => {
//             console.log('/service/get status',res.status);
//             //console.log('/service/get response',res.body);
//             console.log('/service/get body',res.body);
//             expect(res).to.have.status(200);
//     
//             if (err) {
//                console.log('/service/get error',err);
//                return done(err);
//             }
//             done();
//          });
//    });
    
});