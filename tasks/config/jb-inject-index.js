/* 
 * Inject JBConnect plugin dependencies into JBrowse index.html
 */


module.exports = function (grunt) {
    grunt.registerTask('jb-inject-index', 'Inject JBConnect plugin dependencies into JBrowse index.html', function() {
        grunt.log.writeln('Inject JBConnect plugin dependencies into JBrowse index.html');
        let jblib = require('../../api/services/jbutillib');
        jblib.injectIncludesIntoHtml();
    });
};
