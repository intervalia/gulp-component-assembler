var fs = require('fs');
var path = require('path');
var scripts = require("./scripts");
var templates = require("./templates");
var locales = require("./locales");
var plugin = require("./plugin");
var watcher = require("./watcher");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");
var globArray = require("./globArray");
var DEFAULT_USE_PARAMS = "window, document";
var DEFAULT_PASS_PARAMS = DEFAULT_USE_PARAMS;

function areTranslationsAvailable(locale, localePath, localeFileName) {
  "use strict";
  var filePath = path.join(localePath, localeFileName + '_'+locale+'.json');
  return fs.existsSync(filePath);
}

function processAssembly(assembly, assemblyName, options, isSub) {
  "use strict";
  var projectPath = path.dirname(assemblyName);
  var assemblies, contents;
  var iifeParams, iifeCount;
  var pluginParams;
  var localePath, localeFileName;
  var locale, hasTranslations;
  var temp;

  locale = options.locale;
  localeFileName = assembly.localeFileName || "strings";
  localePath = path.join(projectPath, (assembly.localePath || "locales"));
  hasTranslations = areTranslationsAvailable(locale, localePath, localeFileName);
  if (!hasTranslations && localeFileName === "strings") {
    localeFileName  = path.basename(projectPath);
    hasTranslations = areTranslationsAvailable(locale, localePath, localeFileName);
  }

  // *********************
  // Add comment
  contents = (isSub ? '\n\n// Sub-assembly' : '// Assembly') + ': ' + path.basename(projectPath) + "\n";

  pluginParams = {
    "projectPath": projectPath,
    "hasTranslations": hasTranslations,
    "options": options,
    "assembly": assembly,
    "assemblyName": assemblyName,
    "assemblyFileName": path.basename(projectPath),
    "isSub": isSub
  };

  // *********************
  // Process any PRE plug-ins
  contents += plugin.processPre(pluginParams);

  if (options.watch) {
    watcher.addAssembly(assemblyName, assembly);
  }

  // *********************
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
  contents += '(function('+iifeParams+', undefined) {\n';
  if (options.useStrict) {
    contents += '"use strict";\n';
  }

  // *********************
  // Process any INLINE_PRE plug-ins
  contents += plugin.processInlinePre(pluginParams);

  // *********************
  // Process locale files
  if (hasTranslations) {
    contents += locales.process(localePath, localeFileName, path.basename(projectPath), options);
  }

  // *********************
  // Process template files
  contents += templates.process(projectPath, globArray(assembly.templates || ["./templates/*.html"], assemblyName, {cwd: projectPath, root: process.cwd()}), hasTranslations, options);

  // *********************
  // Process 'files' field
  if (assembly.files) {
    contents += scripts.process(projectPath, globArray(assembly.files, assemblyName, {cwd: projectPath, root: process.cwd(), strict: true}), options, hasTranslations, assembly, assemblyName, isSub);
  }

  // *********************
  // Process any INLINE_POST plug-ins
  contents += plugin.processInlinePost(pluginParams);

  // *********************
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

  // *********************
  // Process any POST plug-ins
  contents += plugin.processPost(pluginParams);

  // *********************
  // Process sub assemblies
  if (assembly.subs) {
    var subs = globArray(assembly.subs, assemblyName, {cwd: projectPath, root: process.cwd()});

    if (subs && subs.length > 0) {
      subs.forEach(function(assemblyPath, index) {
        var subAssembly, assemblyName;

        assemblyName = path.relative(projectPath, assemblyPath);

        if (fs.existsSync(assemblyPath)) {
          subAssembly = JSON.parse(fs.readFileSync(assemblyPath, {"encoding": "utf-8"}));
          contents += processAssembly(subAssembly, assemblyPath, options, true);
        }
        else {
          throw new PluginError(PLUGIN_NAME, "Sub-assembly not found: '" + assemblyName + "'" );
        }
      });
    }
  }

  return contents;
}


module.exports = {
  "process": processAssembly,
  "areTranslationsAvailable": areTranslationsAvailable
};
