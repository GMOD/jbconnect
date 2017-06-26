var request = require('supertest');

describe('REST Login Related', function() {

  var url = 'http://localhost:1337';

  describe('/loginstate before login', function() {
    it('should return empty object', function (done) {
      request(sails.hooks.http.app)
        .get('/loginstate')
        .set('Accept', 'application/json')
        .expect(200)
        .expect({},done);
    });
  });

});
