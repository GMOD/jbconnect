/*
 * https://github.com/nightwatchjs/nightwatch-docs/blob/master/guide/extending-nightwatch/custom-commands.md
 */
var util = require('util');
var events = require('events');

function Pause() {
    console.log("****************** Pause");
    events.EventEmitter.call(this);
}

util.inherits(Pause, events.EventEmitter);

Pause.prototype.command = function(ms, cb) {
    console.log(">>>>>>>>>>>>>>>>>> Pause");
    var self = this;
    if (!ms) {
        return this;
    }
    setTimeout(function() {
        // if we have a callback, call it right before the complete event
        if (cb) {
            cb.call(self.client.api);
        }
        self.emit('complete');
    }, ms);

    return this;
};

module.exports = Pause;

