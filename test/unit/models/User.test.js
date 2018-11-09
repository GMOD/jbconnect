const _ = require("lodash");
const tlib = require('../../share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('User Model', function() {

  describe('User.find()', function() {
    it('should check find function', function (done) {
      User.find()
      .then(function(results) {
        // some tests
        //console.log("results",results);
        assert.equal(results[0].username,"juser","find() found item");
        done();
      })
      .catch(done);
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
