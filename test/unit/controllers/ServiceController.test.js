const fs = require('fs-extra');
const nightwatch = require('nightwatch');
const _ = require('lodash');

var argv = require('minimist')(process.argv.slice(2));
var nightwatchTest = argv['nightwatch-test'];
if (typeof nightwatchTest === 'undefined') nightwatchTest = 'default';

var nightwatchConf = require('../../nightwatch.conf.js');
var nw_conf = _.clone(nightwatchConf.test_settings[nightwatchTest]);

var client = nightwatch.initClient(nw_conf);

var browser = client.api();
//console.log('login.test.js','nightwatchTest',nightwatchTest);

//var request = require('supertest');

describe('ServiceController', function() {

    var url = 'http://localhost:1337';
/*
    before(function() {
        // addService - testWorkflowService
    });

    after(function(done) {
        //client.start(done);
    });
*/
    it('it should login with login form', function (done) {
        /*
        browser
            .url('http://localhost:1337/loginstate')
            .waitForElementVisible('body', 5000)
//            .assert.containsText('body xxx', '***', 'check that the text begins with {')
            //.getValue("body pre", function(result) {
              //this.assert.equal(typeof result, "object");
              //this.assert.equal(result.status, 0);
              //this.assert.equal(result.value, "enter username");
              //console.log("result",result);
            //});
        */
/*
        browser
            .url('http://localhost:1337/login')
            .waitForElementVisible('body', 5000)
            .assert.title('New Sails App')
            .waitForElementVisible('body', 1000)
            .assert.visible('h4.modal-title')
            .assert.containsText('h4.modal-title', 'JBrowse Login', 'Checking login box title')
            .waitForElementVisible('div#login-overlay',5000)
            .setValue('div#login-overlay input[name=identifier]','meuser')
            .setValue('div#login-overlay input[name=identifier]','meuser')
            .click('div#login-overlay button[type=submit]')
            .pause(1000);
*/

        //console.log("*** sending loginstate ***");
/*
        browser.apiGet('http://localhost:1337/loginstate', function (response) {
            console.log('response.body'.response.body);
            var data = JSON.parse(response.body);
            console.log('>>>>>>>>>>>> status',data.status);
            client.assert.equal(response.statusCode, 200, "200 OK");
        });
*/        
        //client.start(done);
        done();
    });
/*
    describe('/service test service list', function() {
      it('should return empty object', function (done) {
        request(sails.hooks.http.app)
          .get('/loginstate')
          .set('Accept', 'application/json')
          .expect(200)
          .expect({},done);
      });
    });
*/
});
