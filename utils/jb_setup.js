#!/usr/bin/env node

/* Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 */

const approot = require('app-root-path'); 
const fs = require("fs-extra");
const shelljs = require("shelljs");
const jblib = require('../api/services/jbutillib');

const setupScript = "setup.sh";
const thisPath = process.cwd();

var config = jblib.getMergedConfig();

console.log("config",config);


// check if jbrowse is a module
//if (fs.pathExistsSync(approot+"/node_modules/@gmod/jbrowse/"+setupScript)) {
//    shelljs.cd("node_modules/@gmod/jbrowse");
//}
if (fs.pathExistsSync(config.jbrowsePath+setupScript)) {
    shelljs.cd(config.jbrowsePath);
}

shelljs.exec("./"+setupScript);

shelljs.cd(thisPath);

shelljs.cp(config.jbrowsePath+"/setup.log",approot+"/jbrowse-setup.log");
