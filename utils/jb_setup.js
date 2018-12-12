#!/usr/bin/env node

/* Determines appropriate directory where jbrowse is installed (app root or as a module in node_modules).
 * Then runs setup.sh
 * (this script gets copied to the app root directory upon npm install)
 */

const approot = require('app-root-path'); 
const fs = require("fs-extra");
const sh = require("shelljs");
const jblib = require('../api/services/jbutillib');

const conf = jblib.getMergedConfig();

const setupScript = "setup.sh";
const thisPath = process.cwd();

// check if jbrowse is a module
if (fs.pathExistsSync(conf.jbrowsePath+setupScript)) {
    sh.cd(conf.jbrowsePath);
}

sh.exec("./"+setupScript);

sh.cd(thisPath);

sh.cp(approot+"/node_modules/@gmod/jbrowse/setup.log",approot+"/jbrowse-setup.log");
