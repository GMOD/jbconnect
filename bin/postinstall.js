#!/usr/bin/env node

console.log("jbserver setup");

//var fs = require("fs");
var g = require("../config/globals.js").globals;
var fs = require("fs-extra");

fs.copy(__dirname + '/../node_modules/bootstrap/dist',__dirname + '/../assets/bootstrap',function(err) {
    if (err) {
        console.log("error copying bootstrap",err);
        return;
    }
    console.log("copied assets/bootstrap.");
});
fs.copy(__dirname + '/../node_modules/jquery-ui-dist',__dirname + '/../assets/jquery-ui',function(err) {
    if (err) {
        console.log("error copying jquery-ui",err);
        return;
    }
    console.log("copied assets/jquery-ui.");
    fs.copy(__dirname + '/../assets/jquery-ui/external/jquery',__dirname + '/../assets/jquery',function(err) {
        if (err) {
            console.log("error copying jquery",err);
            return;
        }
        console.log("copied assets/jquery.");
    });
});
