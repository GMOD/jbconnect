// test programatic lifting and lowering of sails

var Sails = require('sails').constructor;

var mySailsApp = new Sails();

mySailsApp.lift({
    // Optionally pass in any other programmatic config overrides you like here.
}, function(err) {
    if (err) {
        console.error('Failed to lift app.  Details:', err);
        return;
    }
    console.log("sails lifted");
    setTimeout(function() {
        mySailsApp.exiting = true;
        console.log("exiting status =", typeof mySailsApp.exiting,mySailsApp.exiting);
        mySailsApp.lower(function (err) {
            if (err) {
                console.log('Could not lower Sails app.  Details:',err);
                return;
            }
            console.log('Successfully lowered Sails app.');
        });
    },3000);
});

