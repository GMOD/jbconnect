var shelljs = require('shelljs');
var approot = require('app-root-path'); 


console.log("Installing JBrowse sample data...");
var cmd = './jb_setup.js';
shelljs.exec(cmd);



