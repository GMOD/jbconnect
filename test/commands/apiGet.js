/* 
 * https://github.com/nightwatchjs/nightwatch/issues/1541
 */

var util = require('util');
var events = require('events');

function apiGet () {
    events.EventEmitter.call(this);
}

util.inherits(apiGet, events.EventEmitter);

apiGet.prototype.command = function(apiUrl, success) {
  var request = require("request");
  var self = this;

  console.log("********************* apiGet called");

  request.get(apiUrl, function (error, response) {
    if (error) {
      console.log('88888888888888888888888888888888888888 error',error);
      return;
    }
    console.log(">>>> success");
    success(response);
    self.emit('complete');
  }.bind(this));
};

module.exports = apiGet;


