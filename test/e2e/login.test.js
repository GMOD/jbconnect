
describe('End-2-End Tests', function() {

    describe('JBClient Login', function() {

        this.timeout(99999999);

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

        it('Test Login', function (client) {
            client
                .url('http://localhost:1337/login')
                .waitForElementVisible('body', 5000)
                .assert.title('New Sails App')
                .waitForElementVisible('body', 1000)
                .assert.visible('h4.modal-title')
                .assert.containsText('h4.modal-title', 'JBrowse Login', 'Checking login box title');

        });
    });
});