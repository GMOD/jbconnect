/* 
 * Inject JBConnect client plugins into JBrowse
 */
const jblib = require('../../api/services/jbutillib');
const approot = require('app-root-path'); 
const sh = require('shelljs');

module.exports = function (grunt) {
    grunt.registerTask('jb-inject-plugins', 'Inject JBConnect client plugins into JBrowse', function() {
        grunt.log.writeln('Inject JBConnect client plugins into JBrowse');

        // plugins are added to the JBrowse plugins directory by symlink
        let countInstalled = jblib.injectPlugins();

        // add plugins into trackList.json
        jblib.setupPlugins();

        if (countInstalled) {
            let origcwd = process.cwd();
            let cfg = jblib.getMergedConfig();
            process.chdir(cfg.jbrowsePath);

            // todo: future enhancement - bypass the build if nothing has changed.

            sh.exec("npm run build");
            process.chdir(origcwd);
        }
    });
};