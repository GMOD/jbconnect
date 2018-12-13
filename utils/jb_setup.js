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

const thisPath = process.cwd();

let setupScript = "./setup.sh";
//setupScript = "npm run build";

// check if jbrowse is a module
if (fs.existsSync(conf.jbrowsePath)) {
    sh.cd(conf.jbrowsePath);
    console.log("dir",process.cwd());
}
else {
    console.log("could not find jbrowse.  check if jbrowsePath is defined.");
    process.exit(1);
}

sh.exec(setupScript);

sh.cd(thisPath);

sh.cp(approot+"/node_modules/@gmod/jbrowse/setup.log",approot+"/jbrowse-setup.log");
