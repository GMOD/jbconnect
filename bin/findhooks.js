var Promise = require('bluebird');
//var fs = require('fs');
var fs = Promise.promisifyAll(require("fs"));
var deferred = require('deferred');

var g = require('../config/globals.js').globals.jbrowse;

var mod = module.exports = {
    workingDir: '',
    mapJbrowsePlugins: function(workingDir) {

        this.workingDir = workingDir;

        var jpath = g.jbrowsePath + "/plugins/";

        fs.readdirAsync(jpath)
        .then(function(plugins) {
            
            for(var i in plugins) {
                var path = jpath + plugins[i] + '/servermod';
                var found = 0;
                try {
                    fs.accessSync(path,fs.F_OK);                    
                    console.log(path);
                    found = 1;
                } catch (err) {
                    
                }
                if (found) step2(path);
            }
        });
 
    }
};

/**
 * look for package json
 * @param {type} path - servermod path
 * @returns {undefined}
 */
function step2(path) {
    var packageFile = path + '/package.json';
    var found = 0;
    try {
        fs.accessSync(packageFile,fs.F_OK);
        found = 1;
    } catch (err) {
        console.log('error opening',packageFile);
    }
    if (found) step3(path,packageFile);
}

/**
 * map symlink within api/hooks
 * @param {type} targetPath
 * @param {type} packageFile
 * @returns {undefined}
 */
function step3(targetPath,packageFile) {
    var content = fs.readFileSync(packageFile);
    var js = JSON.parse(content);
    /*
    console.log("readdirSync");
    var dir = fs.readdirSync(mod.workingDir + '/api/hooks');
    console.log('dir',dir);
    */
    
    var hookName = js.name;
    console.log('JBrowse server module found', hookName);
    
    var path = mod.workingDir + '/api/hooks/' + hookName;
    //console.log(targetPath,path);
    
    try {
        fs.symlinkSync(targetPath,path,'dir');
        console.log('created symlink',path)
    } catch (err) {
        if (err.code = 'EEXIST')
            console.log('symlink exists for',hookName);
        else
            console.log('error mapping ',err.code, targetPath);
    }
    
    
}
