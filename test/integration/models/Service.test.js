var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;


describe('ServiceModel', function() {

    describe('#basic', function() {
        it('should check that find function returns no services', () => {
            return Service.find()
                .then((foundServices) =>{
                    console.log('found '+foundServices.length+' services!')
                    assert.equal(foundServices.length,0)
                })
        });
    });

    describe("#service operations", () => {
        it('should be able to add a service with serviceProc', (done) => {
            let testWorkflowSvc = require('../../data/testWorkflowService');

            // test workflow add service
            let service = {
                name:   'test_workflow',
                type:   'workflow',
                module: 'test',
                handler: testWorkflowSvc                    
            };

            serviceProc.addService(service, (err) => {
                assert.isUndefined(err);
                Service.find({name:'test_workflow'})
                    .then( (foundServices) => {
                        assert.equal(foundServices.length,1)
                        console.log(foundServices)
                    })
                    .then(done,done)
            })
        });
    });
});
