
describe('WorkflowModel', function() {

  describe('#find()', function() {
    it('should check find function', function (done) {
      Workflow.find()
      .then(function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });
  
  describe('#addService()', function() {
    it('should check addService function', function (done) {
      Workflow.addService("test",function(results) {
        // some tests
        done();
      })
      .catch(done);
    });
  });

});
