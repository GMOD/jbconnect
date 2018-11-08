let assert = require('assert');

describe('Dataset Model', function() {

  describe('Dataset.find()', function() {
    it('should check find function', function (done) {
      Dataset.find()
      .then(function(results) {
        assert.equal(results[0].name,"Volvox","Get item found");
        done();
      })
      .catch(done);
    });
  });
  describe('Dataset.Get found', function() {
    it('should check Get function', function (done) {
      Dataset.Get({id:1},function(err,found){
        assert.equal(found[0].name,"Volvox","Get item found");
        done();
      });
    });
  });
  describe('Dataset.Get not found', function() {
    it('should negative Get function', function (done) {
      Dataset.Get({id:100},function(err,found){
        assert.equal(err,null,"Get item not found");
        done();
      });
    });
  });
});
