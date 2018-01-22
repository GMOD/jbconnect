var fs = require('fs-extra');
var shelljs = require('shelljs');
var approot = require('app-root-path');
var jbutillib = require('../api/services/jbutillib.js');

// install default database, don't overwrite if it exists.  Use jbutil --dbreset to reset to default.
jbutillib.install_database();

// run jbrowse jb_setup.js to setup sample data
console.log("Installing JBrowse sample data...");
var cmd = './jb_setup.js';
shelljs.exec(cmd);



