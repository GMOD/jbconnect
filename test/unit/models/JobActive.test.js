const _ = require("lodash");
const tlib = require('../../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('JobActive Model', function() {

  describe('JobActive.find()', function() {
    it('should check find function', function (done) {
      JobActive.find()
      .then(function(results) {
        // some tests
        console.log("results",results);
        assert.equal(results[0].active,0,"find() found item");
        done();
      })
      .catch(done);
    });
  });
  it('should call /jobactive/get', function(done) {
        
    let geturl = '/jobactive/get?id=1';

    agent
      .get(geturl)
      .set('content-type','application/json; charset=utf-8')
      .end((err,res,body) => {
          console.log('/jobactive/get verify',res.body);
          expect(res).to.have.status(200, 'status 200');
          assert.equal(res.body[0].active,0, 'verify name of active flag is zero');

          done();
      });
});

  describe('User.Get()', function() {
    it('should check Get function', function (done) {
      User.Get({username:'juser'},function(err,found) {
        assert.equal(found[0].username,"juser","Get item found");
        done();
      })
    });
  });

});
