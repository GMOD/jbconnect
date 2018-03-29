var fs = require('fs-extra');
var shelljs = require('shelljs');
var approot = require('app-root-path');
var jbutillib = require('../api/services/jbutillib.js');

// install default database, don't overwrite if it exists.  Use jbutil --dbreset to reset to default.
jbutillib.install_database();

// don't copy config.js if it already exists.
let configjs = approot+"/config.js";
if (!fs.existsSync(configjs)) {
    shelljs.cp(approot+'/bin/config.js',configjs);
}

// run jbrowse jb_setup.js to setup sample data
//console.log("Installing JBrowse sample data...");
//var cmd = './jb_setup.js';
//shelljs.exec(cmd);

// copy plugin dependencies to assets/jblib
console.log("Copying plugin dependencies to assets/jblib...");
let targDir = approot+'/assets/jblib';
fs.ensureDirSync(targDir);

// jquery
fs.copySync(approot+'/node_modules/jquery/dist/jquery.min.js',targDir+'/jquery.min.js',{overwrite:true});
// bootstrap
fs.copySync(approot+'/node_modules/bootstrap/dist/css',targDir,{overwrite:true});
fs.copySync(approot+'/node_modules/bootstrap/dist/js',targDir,{overwrite:true});
// jquery-ui
fs.copySync(approot+'/node_modules/jquery-ui-dist',targDir,{overwrite:true});
// mb.extruder
fs.copySync(approot+'/node_modules/jquery.mb.extruder/css',targDir+'/mb.extruder',{overwrite:true});
fs.copySync(approot+'/node_modules/jquery.mb.extruder/inc',targDir+'/mb.extruder',{overwrite:true});
fs.copySync(approot+'/node_modules/jquery.mb.extruder/elements',targDir+'/elements',{overwrite:true});
