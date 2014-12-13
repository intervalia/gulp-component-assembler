var fs = require('fs');
var path = require('path');
var scripts = require("./scripts");
var templates = require("./templates");
//var oldTemplates = require("./oldTemplates");
var locales = require("./locales");
var plugin = require("./plugin");


function processAssembly(assembly, projectPath, options, isSub) {
  "use strict";
  var files, assemblies, contents, iifeParams, pluginParams,
      locale, localePath, localeFileName, hasTranslations;
  //console.log("processAssembly", projectPath);

  locale = options.locale;
  localeFileName = assembly.localeFileName || "strings";
  localePath = path.join(projectPath, (assembly.localePath || "locales"));
  hasTranslations = fs.existsSync(path.join(localePath, localeFileName + '_'+locale+'.json'));
  if (!hasTranslations && localeFileName === "strings") {
    localeFileName  = path.basename(projectPath);
    hasTranslations = fs.existsSync(path.join(localePath, localeFileName + '_'+locale+'.json'));
  }

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
  // TODO: Allow iifeParams to either be a string, or an object {"use": "window, $, _a", "pass", "window, jQuery, angular"}
  iifeParams = options.iifeParams || "window,document";
  contents += '\n(function('+iifeParams+',undefined) {\n';

  // Process 'files' field
  contents += scripts.process(projectPath, assembly.files, options);

  // Process locale files
  if (hasTranslations) {
    contents += locales.process(localePath, localeFileName, path.basename(projectPath), options);
  }

  // Process template files
  contents += templates.process(path.join(projectPath, (assembly.templatePath || "templates")), hasTranslations, options);

  // Process any inline plugins
  contents += plugin.processInline(pluginParams);

  // Close IIFE
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
        throw new PluginError(PLUGIN_NAME, "Sub assembly not found: '" + assemblyFileName + "'" );
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
