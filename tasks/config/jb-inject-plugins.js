/* 
 * Inject JBConnect client plugins into JBrowse
 */
const jblib = require('../../api/services/jbutillib');
const approot = require('app-root-path'); 
const sh = require('shelljs');

module.exports = function (grunt) {
    grunt.registerTask('jb-inject-plugins', 'Inject JBConnect client plugins into JBrowse', function() {
        grunt.log.writeln('Inject JBConnect client plugins into JBrowse');
        let countInstalled = jblib.injectPlugins();
        jblib.setupPlugins();
        
        if (countInstalled) {
            let origcwd = process.cwd();
            let cfg = jblib.getMergedConfig();
            process.chdir(cfg.jbrowsePath);
            sh.exec("npm run build");
            process.chdir(origcwd);
        }
    });
};