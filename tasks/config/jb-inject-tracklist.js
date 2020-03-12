/* 
 * Inject REST statement into trackList.json per dataset.
 * 
 * Injects this into trackList.json into each known dataset defined
 *   "include": [
 *       "/track/get_tracklist?dataset=sample_data/json/volvox"
 *   ],
 * 
 */


module.exports = function (grunt) {
    grunt.registerTask('jb-inject-tracklist', 'Inject REST include statement into trackList.json', function() {
        grunt.log.writeln('Inject REST include statement into trackList.json');
        let jblib = require('../../api/services/jbutillib');
        jblib.injectTracklist();
    });
};
