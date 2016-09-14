#!/usr/bin/env node

console.log("jbserver post install...");

var fs = require("fs");
var g = require("../config/globals.js").globals;

//console.log(g);

var blastPath = g.jbrowse.jbrowsePath + g.jbrowse.dataSet[0].dataPath + g.jbrowse.jblast.blastResultPath;
blastPath += '/';

console.log('blastPath',blastPath);

// if direcgtory doesn't exist, create it
if (!fs.existsSync(blastPath)){
    fs.mkdirSync(blastPath);
}  

// copy template file
var tFile = "inMemTemplate.json";

console.log('Copying template file', tFile);

fs.createReadStream('./bin/'+tFile).pipe(fs.createWriteStream(blastPath+tFile));
