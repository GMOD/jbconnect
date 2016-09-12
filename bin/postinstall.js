#!/usr/bin/env node

console.log("jbserver post install thingy");

var g = sails.config.globals;

var blastPath = g.jbrowse.jbrowsePath + g.jbrowse.dataSet[0].dataPath + g.jbrowse.jblast.blastResultPath;
theBlastFile = blastPath+'/'+theBlastFile; 
console.log("theBlastFile",theBlastFile);

// if direcgtory doesn't exist, create it
if (!fs.existsSync(blastPath)){
    fs.mkdirSync(blastPath);
}  
