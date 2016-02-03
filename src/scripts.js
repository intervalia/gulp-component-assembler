var fs = require('fs');
var path = require('path');
var plugin = require("./plugin");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");

function processOneScript(scriptPath, includeName, options, newPluginParams) {
  var contents = "/*\n * Included File: " + includeName + "\n */\n";

  if (!fs.existsSync(scriptPath)) {
    return contents + "console.warn('" + scriptPath + " does not match any file');";
  }

  contents += plugin.processFilePre(newPluginParams);
  contents += fs.readFileSync(scriptPath, {"encoding": "utf-8"}).replace(/[\n\r]/g, "\n");
  contents += plugin.processFilePost(newPluginParams);

  return contents;
}

function processScripts(projectPath, files, options, hasTranslations, assembly, assemblyName, isSub) {
  var contents = "";
  var newPluginParams;

  if (files.length > 0) {
    files.forEach(function(filePath) {
      var fileName = path.basename(filePath);
      var includeName = filePath;

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

      // glob always returns the absolute path
      if (filePath[0] === "/") {
        includeName = path.relative(projectPath, filePath);
      }

      contents += processOneScript(filePath, includeName, options, newPluginParams) + "\n\n";
    });
  }

  return contents;
}

module.exports = {
  "process": processScripts
};
