var nightwatch = require('nightwatch');

console.log('login.test.js');

describe('JBlast Login', function() {

    var nightwatchConf = require('../nightwatch.conf.js');
    var nw_conf = Object.assign(
        //nightwatchConf.test_settings.default
        nightwatchConf.test_settings.phantomjs
    );
    var client = nightwatch.initClient(nw_conf);

    var browser = client.api();
//    browser.globals = require('../browserGlobals.js');
    
    this.timeout(99999999);

    before(function() {
        browser.perform(function() {
            console.log('beforeAll');
        });
    });

    beforeEach(function(done) {
        browser.perform(function() {
            console.log('beforeEach');
        });
        client.start(done);
    });

    it('Test Login', function (done) {
        browser
            .url('http://localhost:1337/login')
            .waitForElementVisible('body', 5000)
            .assert.title('New Sails App')
            .waitForElementVisible('body', 1000)
            .assert.visible('h4.modal-title')
            .assert.containsText('h4.modal-title', 'JBrowse Login', 'Checking login box title');

        client.start(done);
    });

    afterEach(function() {
        browser.perform(function() {
            console.log('afterEach');
        });
    });

    after(function(done) {
        browser.end(function() {
            console.log('afterAll');
        });
        client.start(done);
    });
});
