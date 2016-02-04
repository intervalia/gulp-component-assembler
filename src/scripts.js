var fs = require('fs');
var path = require('path');
var plugin = require("./plugin");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");

function processOneScript(scriptPath, includeName, options, pluginParams) {
  var contents = "/*\n * Included File: " + includeName + "\n */\n";
  var temp;

  if (!fs.existsSync(scriptPath)) {
    return contents + "console.warn('" + scriptPath + " does not match any file');";
  }

  // Process any BEFORE_JS_FILE plug-ins
  temp = plugin.process(plugin.types.BEFORE_JS_FILE, pluginParams);
  if (temp) {
    contents += temp + "\n\n";
  }

  contents += fs.readFileSync(scriptPath, {"encoding": "utf-8"}).replace(/[\n\r]/g, "\n");

  // Process any AFTER_JS_FILE plug-ins
  temp = plugin.process(plugin.types.AFTER_JS_FILE, pluginParams);
  if (temp) {
    contents += temp;
  }

  return contents;
}

function processScripts(projectPath, files, options, hasTranslations, assembly, assemblyName, isSub) {
  var contents = [];
  var pluginParams;

  if (files.length > 0) {
    files.forEach(function(filePath, index) {
      var fileName = path.basename(filePath);
      var includeName = filePath;

      pluginParams = {
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

      contents.push(processOneScript(filePath, includeName, options, pluginParams));
    });
  }

  // add space in between plugins
  return contents.join('\n\n');
}

module.exports = {
  "process": processScripts
};
