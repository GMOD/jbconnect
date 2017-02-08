#!/usr/bin/env node

console.log("jbserver post install...");

var fs = require("fs");
var g = require("../config/globals.js").globals;

var cp = require('directory-copy');

var options =    { 
        src: __dirname + '/../node_modules/bootstrap/dist', 
        dest: __dirname + '/../assets/bootstrap'
    };
 
console.log("options",options);

//process.exit(1);

cp(options    
  , function () {
    console.log('done!')
  })
  .on('log', function (msg, level) {
    // Level is debug, info, warn or error 
    console.log(level + ': ' + msg)
  })






