const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;
//var request = require('supertest');

describe('UserController', function() {

    agent = chai.request.agent(server);

//    describe('/loginstate before login', function() {
//        
//        it('should return empty object', function (done) {
//            agent(sails.hooks.http.app)
//              .get('/login')
//              .set('Accept', 'application/json')
//              .expect(200)
//              .expect({},done);
//        });
//    });

});
