var request = require('supertest');

describe('UserController', function() {

    var url = 'http://localhost:1337';

    describe('/loginstate before login', function() {
        
        it('should return empty object', function (done) {
            request(sails.hooks.http.app)
              .get('/login')
              .set('Accept', 'application/json')
              .expect(200)
              .expect({},done);
        });
    });

});
