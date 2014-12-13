var fs = require('fs');
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");

function processOneScript(scriptPath, includeName) {
  if (!fs.existsSync(scriptPath)) {
    throw new PluginError(PLUGIN_NAME, 'Script file not found: '+scriptPath+'.');
  }

  var contents = "/*\n * Included File: " + includeName + "\n */\n";
  contents += fs.readFileSync(scriptPath, {"encoding": "utf-8"});
  contents += "\n";

  return contents;
}

function processScripts(projectPath, files, options) {
  var contents = "";

  if (files.length > 0) {
    files.forEach(function(fileName) {
      contents += processOneScript(path.join(projectPath, fileName), fileName, options);
    });
  }

  return contents;
}

module.exports = {
  "process": processScripts
};
