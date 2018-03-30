/* 
 * Inject JBConnect client plugins into JBrowse
 */

module.exports = function (grunt) {
    grunt.registerTask('jb-inject-plugins', 'Inject JBConnect client plugins into JBrowse', function() {
        grunt.log.writeln('Inject JBConnect client plugins into JBrowse');
        let jblib = require('../../api/services/jbutillib');
        jblib.injectPlugins();
        jblib.setupPlugins();
    });
};