var webdriver = require('selenium-webdriver');
var client = new webdriver.Builder().withCapabilities({
        'browserName': 'chrome'
}).build();
var chai = require('chai');
var expect = chai.expect;
    
describe('from home page', function(){
        
    var url = '/login';

    beforeEach(function(done) {
        client.get(url).then(function() {
            done();
        });
    });
    
    after(function(done) {
        client.quit().then(function() {
            done();
        });
    });
    
    it('returns the title of the page');
    
    
});