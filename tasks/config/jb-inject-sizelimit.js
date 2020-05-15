/* 
 * Inject bpSizeLimit into trackList.json
 * applies to all datasets if undefined
 */
const jblib = require('../../api/services/jbutillib');

module.exports = function (grunt) {
    grunt.registerTask('jb-inject-sizelimit', 'Inject bpSizeLimit into trackList.json', function() {
        grunt.log.writeln('Inject bpSizeLimit into trackList.json');

        let countInstalled = jblib.inject_bpSizeLimit();

    });
};