var fs = require('fs');
var path = require('path');
var plugin = require("./plugin");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");

function processOneScript(scriptPath, includeName, options, newPluginParams) {
  if (!fs.existsSync(scriptPath)) {
    throw new PluginError(PLUGIN_NAME, 'Script file not found: '+scriptPath+'.');
  }

  var contents = "/*\n * Included File: " + includeName + "\n */\n";
  contents += plugin.processFilePre(newPluginParams);
  contents += fs.readFileSync(scriptPath, {"encoding": "utf-8"}).replace(/\r\n/g, "\n");
  contents += "\n";
  contents += plugin.processFilePost(newPluginParams);

  return contents;
}

function processScripts(projectPath, files, options, hasTranslations, assembly, assemblyName, isSub) {
  var contents = "";
  var newPluginParams;

  if (files.length > 0) {
    files.forEach(function(fileName) {
      var filePath = path.join(projectPath, fileName);
      newPluginParams = {
        "projectPath": projectPath,
        "hasTranslations": hasTranslations,
        "options": options,
        "assembly": assembly,
        "assemblyName": assemblyName,
        "assemblyFileName": path.basename(projectPath),
        "isSub": isSub,
        "fileName": fileName,
        "filePath": filePath
      };

      contents += processOneScript(filePath, fileName, options, newPluginParams);
    });
  }

  return contents;
}

module.exports = {
  "process": processScripts
};
