var fs = require('fs');
var path = require('path');
var scripts = require("./scripts");
var templates = require("./templates");
var locales = require("./locales");
var plugin = require("./plugin");
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");
var globArray = require("./globArray");
var DEFAULT_USE_PARAMS = "window, document";
var DEFAULT_PASS_PARAMS = DEFAULT_USE_PARAMS;

// if the string does not start with "fs.", it is not a taas key
var isNotTaasKeyRegex = /^(?!fs\.)[A-Za-z0-9_.]+/;

function areTranslationsAvailable(locale, localePath, localeFileName) {
  "use strict";
  var filePath = path.join(localePath, localeFileName + '_'+locale+'.json');

  // if the first translation key does not start with `fs.`, it is not considered a TaaS key
  // and we will continue to bundle translations into the assembly
  try {
    var localeFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    var firstKey = Object.keys(localeFile)[0];

    return isNotTaasKeyRegex.test(firstKey);
  }
  catch (e) {
    return false;
  }
}

function processAssembly(assembly, assemblyName, options, isSub) {
  "use strict";
  var projectPath = path.dirname(assemblyName);
  var assemblies, contents, assemblyContents = "";
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
  // Process any BEFORE plug-ins
  if (!isSub) {
    temp = plugin.process(plugin.types.BEFORE, pluginParams);
    if (temp) {
      contents += temp + "\n\n";
    }
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
    contents += '"use strict";\n\n';
  }
  else {
    contents += '\n';
  }

  // *********************
  // Process any BEFORE_ASSEMBLY plug-ins
  temp = plugin.process(plugin.types.BEFORE_ASSEMBLY, pluginParams);
  if (temp) {
    assemblyContents += temp + "\n\n";
  }

  // *********************
  // Process locale files
  if (hasTranslations) {
    assemblyContents += locales.process(localePath, localeFileName, path.basename(projectPath), options) + "\n\n";
  }

  // *********************
  // Process template files
  temp = templates.process(projectPath, globArray(assembly.templates || ["./templates/*.html"], {cwd: projectPath, root: process.cwd()}), hasTranslations, options);
  if (temp) {
    assemblyContents += temp + "\n\n";
  }

  // *********************
  // Process 'files' field
  if (assembly.files) {
    assemblyContents += scripts.process(projectPath, globArray(assembly.files, {cwd: projectPath, root: process.cwd()}), options, hasTranslations, assembly, assemblyName, isSub) + "\n\n";
  }

  // *********************
  // Process any AFTER_ASSEMBLY plug-ins
  temp = plugin.process(plugin.types.AFTER_ASSEMBLY, pluginParams);
  if (temp) {
    assemblyContents += temp + "\n\n";
  }

  // select all newline characters (except for the last ones) and indent by 1 level for better
  // code readability of assembly contents
  contents += "  " + assemblyContents.replace(/[\n\r](.+?)(?=[\n\r])/g, function(match, p1) {
    return "\n  " + p1;
  });

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
  contents += '})(' + iifeParams + ');\n';

  // *********************
  // Process sub assemblies
  if (assembly.subs) {
    var subs = globArray(assembly.subs, {cwd: projectPath, root: process.cwd()});

    if (subs && subs.length > 0) {
      subs.forEach(function(assemblyPath, index) {
        var subAssembly;

        if (fs.existsSync(assemblyPath)) {
          subAssembly = JSON.parse(fs.readFileSync(assemblyPath, {"encoding": "utf-8"}));
          contents += processAssembly(subAssembly, assemblyPath, options, true);
        }
        else {
          throw new PluginError(PLUGIN_NAME, "Sub-assembly not found: '" + assemblyPath + "' in assembly " + assemblyName);
        }
      });
    }
  }

  // *********************
  // Process any AFTER plug-ins
  if (!isSub) {
    temp = plugin.process(plugin.types.AFTER, pluginParams);
    if (temp) {
      contents += temp + "\n";
    }
  }

  return contents;
}


module.exports = {
  "process": processAssembly,
  "areTranslationsAvailable": areTranslationsAvailable
};