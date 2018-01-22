var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;


describe('ServiceModel', function() {

    describe('#basic', function() {
        it('should check find function', function (done) {
            Service.find()
            .then(function(results) {
              // some tests
              done();
            })
            .catch(done);
        });
    });
    describe("Service Operations", function() {
        before(function(done) {
            // addService - testWorkflowService
            it('should check call addService()', function () {
                var testWorkflowSvc = require('../../data/testWorkflowService');

                // test workflow add service
                var service = {
                    name:   'test_workflow',
                    type:   'workflow',
                    module: 'test',
                    handler: testWorkflowSvc                    
                };
                var p = Service.addService(service,function(result){
                    console.log("addService result typeof - ",typeof result);
                    console.log('addService result',result);
                    p.resolve();
                    done();
                });
            });
        });

        after(function() {
            //client.start(done);
        });
        it('should check addService() and verify', function (done) {
            Service.find({name:'test_workflow'}, function(err, found) {

                assert.notTypeOf('undefined', ' find service');
                if (err) {
                    return done(err);
                }
                console.log('Services:',found);
                done();
            });
        });
        
    });
});
