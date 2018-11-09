const _ = require("lodash");
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
    it('should call rest /user/get', function(done) {
        agent
          .get('/user/get')
          .set('content-type','application/json; charset=utf-8')
          .end((err,res,body) => {
                expect(res).to.have.status(200);
                assert.equal(_.isEmpty(res.body),false,"should not be empty");
                assert.equal(res.body[0].username,'juser',"should be juser");
                done();
          });
    });
    it('should register a new user', function(done) {
        
        //let app = sails.hooks.http.app;
        agent = chai.request.agent(server);

        agent
          .post('/auth/local/register?next=/jbrowse')
          .set('content-type', 'application/x-www-form-urlencoded; application/json; charset=utf-8')
          .send({
              'username':'ike.mike',
              'email':'tester1@gmail.com',
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
                     expect(res.body.user.username).to.equal('ike.mike','login username is juser');

                     done();
                  });
          });
    });
    it('should set ike.mike to admin', function(done) {
        User.SetAdmin('ike.mike',true,function(err){
            User.Get({username:'ike.mike'},function(err,found) {
                assert.equal(found[0].admin,true,"ike.mike admin flag set");
                done();
            });
        });
    });
    it('should unset ike.mike to admin', function(done) {
        User.SetAdmin('ike.mike',false,function(err){
            User.Get({username:'ike.mike'},function(err,found) {
                assert.equal(found[0].admin,false,"ike.mike admin flag unset");
                done();
            });
        });
    });
    it('should set ike.mike password', function(done) {
        User.SetPassword('ike.mike','8candycane',function(err){
            User.find({username:'ike.mike'},function(err,found) {
                console.log(found[0]);
                // verify password change
                agent
                .post('/auth/local?next=/jbrowse')
                .set('content-type', 'application/x-www-form-urlencoded; application/json; charset=utf-8')
                .send({
                    'identifier':'ike.mike',
                    'password':'8candycane',
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
                           expect(res.body.user.username).to.equal('ike.mike','login username is ike.mike');
      
                           done();
                        });
                });
      
                //done();
            });
        });
    });
});