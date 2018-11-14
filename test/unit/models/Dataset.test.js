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
  describe('Dataset.Get', function() {
    it('should check Get function', function (done) {
      Dataset.Get({id:1},function(err,found){
        assert.equal(found[0].name,"Volvox","Get item found");
        done();
      });
    });
  });
  describe('Dataset.Get', function() {
    it('should negative Get function', function (done) {
      Dataset.Get({id:100},function(err,found){
        assert.equal(err,null,"Get item not found");
        done();
      });
    });
  });
  describe('Dataset.Resolve', function() {
    it('should get dataset given path', function (done) {
      let dataset = Dataset.Resolve("sample_data/json/volvox");
      assert.equal(dataset.id,1,"resolve should be id=1");
      assert.equal(dataset.path,"sample_data/json/volvox","resolve should be path=sample_data/json/volvox");
      done();
    });
  });
  describe('Dataset.Resolve', function() {
    it('should get dataset given id', function (done) {
      let dataset = Dataset.Resolve("sample_data/json/volvox");
      assert.equal(dataset.id,1,"resolve should be id=1");
      assert.equal(dataset.path,"sample_data/json/volvox","resolve should be path=sample_data/json/volvox");
      done();
    });
  });
  describe('Dataset.Resolve', function() {
    it('should get an error and return null given id that is not in list', function (done) {
      let dataset = Dataset.Resolve("not-here");
      assert.equal(dataset,null,"resolve value not found");
      done();
    });
  });
  
});
