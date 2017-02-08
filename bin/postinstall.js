#!/usr/bin/env node

console.log("jbserver setup");

//var fs = require("fs");
var g = require("../config/globals.js").globals;
var fs = require("fs-extra");


fs.copy(__dirname + '/../node_modules/bootstrap/dist',__dirname + '/../assets/bootstrap',function(err) {
    console.log("copied bootstrap.");
});
fs.copy(__dirname + '/../node_modules/jquery/dist',__dirname + '/../assets/jquery',function(err) {
    console.log("copied jquery.");
});

