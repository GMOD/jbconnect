
describe('End-2-End:', function() {

        this.timeout(10000);
        it('JBrowse login sidget', function (client) {
            client
                // start the login page and login
                .url('http://localhost:1337/jbrowse/?data=sample_data%2Fjson%2Fvolvox')
                .waitForElementVisible('div.track-label[id="label_DNA"]',4000)
                .assert.visible('div.track-label[id="label_DNA"]')
                .waitForElementVisible('button.jb-login-icon',4000)
                .click('button.jb-login-icon')
                .pause(500)
                .setValue('input.form-control:nth-child(1)', 'juser')
                .click('input.form-control:nth-child(3)')
                .setValue('input.form-control:nth-child(3)', 'password')
                .pause(1000)
                .click('button.jb-form-button[type="submit"]');
        });
        it('Success login', function (client) {
            client
                .waitForElementVisible('button.jb-user-icon',4000)
                .assert.visible('button.jb-user-icon')
                .assert.containsText('button.jb-user-icon', 'juser', 'Checking if logged in as juser')
                .click('button.jb-user-icon');
        });
        
        it('click logout', function (client) {
            client
                .waitForElementVisible('a[id="button-logout"]',3000)
                .assert.visible('a[id="button-logout"]')
                .pause(1000)
                .click('a[id="button-logout"]');
        });
        it('Success success', function (client) {
          client
              .waitForElementVisible('button.jb-login-icon',4000)
              .assert.visible('button.jb-login-icon');
      });
  });
