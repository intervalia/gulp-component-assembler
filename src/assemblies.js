var fs = require('fs');
var path = require('path');
var scripts = require("./scripts");
var templates = require("./templates");
var locales = require("./locales");
var plugin = require("./plugin");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");
var globArray = require("./globArray");
var DEFAULT_USE_PARAMS = "window,document";
var DEFAULT_PASS_PARAMS = DEFAULT_USE_PARAMS;

function areTranslationsAvailable(projectPath, locale, localePath, localeFileName) {
  hasTranslations = fs.existsSync(path.join(localePath, localeFileName + '_'+locale+'.json'));
  if (!hasTranslations && localeFileName === "strings") {
    localeFileName  = path.basename(projectPath);
    hasTranslations = fs.existsSync(path.join(localePath, localeFileName + '_'+locale+'.json'));
  }
}

function processAssembly(assembly, projectPath, options, isSub) {
  "use strict";
  var assemblies, contents;
  var iifeParams, iifeCount;
  var pluginParams;
  var localePath, localeFileName;
  var locale, hasTranslations;
  var temp;

  locale = options.locale;
  localeFileName = assembly.localeFileName || "strings";
  localePath = path.join(projectPath, (assembly.localePath || "locales"));
  hasTranslations = areTranslationsAvailable(projectPath, locale, localePath, localeFileName);

  // Add comment
  contents = (isSub ? '\n\n// Sub-assembly' : '// Assembly') + ': ' + path.basename(projectPath) + "\n";

  if (!isSub) {
    pluginParams = {
      "projectPath": projectPath,
      "hasTranslations": hasTranslations,
      "options": options,
      "assembly": assembly
    };

    contents += plugin.processPre(pluginParams);
  }

  // OPEN IIFE
  iifeParams = options.iifeParams || DEFAULT_USE_PARAMS;
  if (typeof iifeParams === "object") {
    iifeParams = iifeParams.use;
    if (!iifeParams || (typeof iifeParams !== "string")) {
      throw new PluginError(PLUGIN_NAME, "The option `iifeParams.use` was not defined as a string." );
    }
    temp = iifeParams.split(",");
    iifeCount = temp.length;
  }
  contents += '\n(function('+iifeParams+',undefined) {\n';
  if (options.useStrict) {
    contents += '"use strict";\n';
  }

  // Process 'files' field
  if (assembly.files) {
    contents += scripts.process(projectPath, globArray(assembly.files, {cwd: projectPath}), options);
  }

  // Process locale files
  if (hasTranslations) {
    contents += locales.process(localePath, localeFileName, path.basename(projectPath), options);
  }

  // Process template files
  contents += templates.process(projectPath, globArray(assembly.templates || ["./templates/*.html"], {cwd: projectPath}), hasTranslations, options);

  // Process any inline plugins
  contents += plugin.processInline(pluginParams);

  // Close IIFE
  iifeParams = options.iifeParams || DEFAULT_USE_PARAMS;
  if (typeof iifeParams === "object") {
    iifeParams = iifeParams.pass;
    if (!iifeParams || (typeof iifeParams !== "string")) {
      throw new PluginError(PLUGIN_NAME, "The option `iifeParams.pass` was not defined as a string." );
    }
    temp = iifeParams.split(",");
    if (iifeCount != temp.length) {
      throw new PluginError(PLUGIN_NAME, "The options `iifeParams.use` and `iifeParams.pass` do not have the same number of parameters." );
    }
  }
  contents += '\n})(' + iifeParams + ');\n';

  // Process sub assemblies
  if (assembly.assemblies) {
    assembly.assemblies.forEach(function(assemblyName, index) {
      var assemblyPath, subAssembly, assemblyFileName;

      assemblyPath = path.join(projectPath, assemblyName);
      assemblyFileName = path.join(assemblyPath, "assembly.json");
      if (fs.existsSync(assemblyFileName)) {
        subAssembly = JSON.parse(fs.readFileSync(assemblyFileName, {"encoding": "utf-8"}));
        contents += processAssembly(subAssembly, assemblyPath, options, true);
      }
      else {
        throw new PluginError(PLUGIN_NAME, "Sub-assembly not found: '" + assemblyFileName + "'" );
      }
    });
  }

  if (!isSub) {
    contents += plugin.processPost(pluginParams);
  }

  return contents;
}


module.exports = {
  "process": processAssembly
};
