/**
 * gendocs init
 * - run jsdoc
 * - run makeapi.js
 */
var fs = require('fs-extra');
var shelljs = require('shelljs');

var jsdoc = './node_modules/jsdoc/jsdoc.js -t node_modules/jsdoc-sphinx/template/ -d ./docs/genapi-rst ./api/**/*.js';
var makeapi = 'node makeapi.js';

// remove genapi-rst/*.rst files
shelljs.exec('rm -f ./docs/genapi-rst/*.rst',{silent:false});

// run jsdoc
shelljs.exec(jsdoc,{silent:false});

// run makapi
process.chdir('./docs');
//console.log('cwd',process.cwd());
shelljs.exec(makeapi,{silent:false});


