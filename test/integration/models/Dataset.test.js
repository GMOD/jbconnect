describe('DatasetModel', function() {

  describe('#find()', function() {
    it('should check find function', function (done) {
      Dataset.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });

});
