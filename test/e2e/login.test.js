const nightwatch = require('nightwatch');
const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));

var nightwatchTest = argv['nightwatch-test'];
if (typeof nightwatchTest === 'undefined') nightwatchTest = 'default';

var nightwatchConf = require('../nightwatch.conf.js');
var nw_conf = _.clone(nightwatchConf.test_settings[nightwatchTest]);
var client = nightwatch.initClient(nw_conf);

var browser = client.api();
console.log('login.test.js','nightwatchTest',nightwatchTest);

describe('End-2-End Tests -------------------------------------------------------', function() {


    describe('JBClient Login', function() {
    /*
        var nightwatchConf = require('../nightwatch.conf.js');
        var nw_conf = Object.assign(
            nightwatchConf.test_settings[nightwatchTest]
        );
        var client = nightwatch.initClient(nw_conf);

        var browser = client.api();
    */
    //    browser.globals = require('../browserGlobals.js');

        this.timeout(99999999);
/*
        before(function() {
            browser.perform(function() {
                console.log('beforeAll');
            });
        });
*/
        beforeEach(function(done) {
            browser.perform(function() {
                console.log('beforeEach');
            });
            done();
            //client.start(done);
        });

        it('Test Login', function (done) {
            browser
                .url('http://localhost:1337/login')
                .waitForElementVisible('body', 5000)
                .assert.title('New Sails App')
                .waitForElementVisible('body', 1000)
                .assert.visible('h4.modal-title')
                .assert.containsText('h4.modal-title', 'JBrowse Login', 'Checking login box title');

            //client.start(done);
            done();
        });
/*
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
*/
    });
});