
const fs = require("fs");

module.exports = ((settings) => {
  const seleniumServerFileName =
  fs.readdirSync("node_modules/selenium-standalone/.selenium/selenium-server/");
  settings.selenium.server_path += seleniumServerFileName;
  return settings;
})(require("./nightwatch.json"));

/*
module.exports = (function(settings) {
  settings.test_workers = false;
  return settings;
})(require('./nightwatch.json'));
*/