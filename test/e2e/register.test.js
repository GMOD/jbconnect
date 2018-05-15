
describe('End-2-End:', function() {

        this.timeout(10000);

        before(function(client, done) {
          done();
        });

        after(function(client, done) {
          client.end(function() {
            done();
          });
        });

        afterEach(function(client, done) {
          done();
        });

        beforeEach(function(client, done) {
          done();
        });

        it('JBClient Register Page', function (client) {
            client
                // start the login page and login
                .url('http://localhost:1337/register')
                .waitForElementVisible('body', 1000)
                .assert.visible('h4.modal-title')
                .assert.containsText('h4.modal-title', 'JBrowse Register New User', 'Checking login box title')
                .setValue("input[name='username']", ['testuser'])
                .setValue("input[name='email']", ['testuser@gmail.com'])
                .setValue("input[name='password']", ['password'])
                .click('button[name="submit"]');
        });
        it('Success registering', function (client) {
            client
                // verify the launch volvox link is there
                .waitForElementVisible('a[href="?data=sample_data/json/volvox"]',3000)
                .assert.visible('a[href="?data=sample_data/json/volvox"]')
                .click('a[href="?data=sample_data/json/volvox"]');
        });
        it('Start GenomeBrowser', function (client) {
            client
                // check hierarchical track pane is there
                .waitForElementVisible('div[widgetid="hierarchicalTrackPane"]',3000)
                .assert.visible('div[widgetid="hierarchicalTrackPane"]');
        });
});
