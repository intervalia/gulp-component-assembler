var fs = require('fs');
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");
var validKeyTest = /^[a-zA-Z_][0-9a-zA-Z_]*$/;
var CR_LF = /(\r*\n+)+/g;
var WS = /\s+/g;
var APOS = /'/g;

function processTemplates(projectPath, templateList, hasTranslations, options) {
  var contents = "", templatesLoaded = false;

  if (templateList && templateList.length > 0) {
    templateList.forEach(function(templateName, index) {
      var fileName = path.join(projectPath, templateName);
      if (templatesLoaded) {
        contents += ',\n';
      }
      else {
        contents += "\nvar templateList = {\n";
        templatesLoaded = true;
      }

      contents += processOneTemplate(fileName, options);
    });
  }

  if (templatesLoaded) {
    contents += '\n};\n\nfunction getTemplateStr(key) {';
    if (hasTranslations) {
      contents += '\n return (templateList[key]||"").format(lang);\n}';
    } else {
      contents += '\n return templateList[key]||"";\n}';
    }
    contents += '\n\n' +
                'function getTemplate(key) {\n'+
                ' var snip = document.createElement("div");\n'+
                ' $(snip).html(getTemplateStr(key));\n'+
                ' return snip;\n'+
                '}\n';
  }

  return contents;
}

function processOneTemplate(templatePath, options) {
  var modName, ext, templateKey, template, contents = "";

  ext = path.extname(templatePath);
  modName = path.basename(templatePath);
  templateKey = path.basename(templatePath, ext);

  if(!validKeyTest.test(templateKey)){
    throw new PluginError(PLUGIN_NAME, 'Invalid Template name: '+templatePath+'\nTemplate file names can only use _ or alphanumeric characters.');
  }

  contents = " // Included template file: " + modName + "\n" +
             ' "'+templateKey+'":';

  template = fs.readFileSync(templatePath, {"encoding": "utf-8"});
  template = template.replace(CR_LF, "\n");
  if (options.minTemplateWS) {
    template = template.replace(WS, " ");
  }
  var lines = template.split("\n");
  lines.forEach(function(line, index) {
    line = line.trimRight();
    if (line.length > 0) {
      if (index > 0) {
        contents += "+\n";
      }

      contents += " '" + line.replace(APOS, "\\'");
      if (!options.minTemplateWS) {
        contents += "\\n";
      }
      contents += "'";
    }
  });

  return contents;
}

module.exports = {
  "process": processTemplates
};
