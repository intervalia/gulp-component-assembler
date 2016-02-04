var fs = require('fs');
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");
var validKeyTest = /^[a-zA-Z_][0-9a-zA-Z_]*$/;
var CR_LF = /[\r\n]+/g;
var WS = /\s+/g;
var APOS = /'/g;
var COMMENTS = /^(\s*<![^<]*)+|(\s*<![^<]*)+$/g;

function processTemplates(projectPath, templateList, hasTranslations, options) {
  var contents = "", templatesLoaded = false;

  if (templateList && templateList.length > 0) {
    templateList.forEach(function(templatePath, index) {
      if (templatesLoaded) {
        contents += ',\n';
      }
      else {
        contents += "var templateList = {\n";
        templatesLoaded = true;
      }

      contents += processOneTemplate(projectPath, templatePath, options);
    });
  }

  if (templatesLoaded) {
    contents += '\n};\n\nfunction getTemplateStr(key) {\n' +
                '  if (!templateList[key]) {\n' +
                '    console.warn("No template named \'" + key + "\'");\n' +
                '  }\n';
    if (hasTranslations) {
      contents += '\n  return (templateList[key] || "").format(lang);\n}';
    } else {
      contents += '\n  return templateList[key] || "";\n}';
    }
    contents += '\n\n' +
                'function getTemplate(key) {\n'+
                '  var snip = document.createElement("div");\n'+
                '  snip.innerHTML = getTemplateStr(key);\n';

    if (options.allowMultiRootTemplates) {
      contents += '  return snip;\n';
    }
    else {
      contents += '  if (snip.children.length > 1) { \n' +
                  '    throw new Error("template \'" + key + "\' must have exactly one root element");\n' +
                  '  }\n' +
                  '  return snip.firstChild;\n';
    }

    contents += '}';
  }

  return contents;
}

function processOneTemplate(projectPath, templatePath, options) {
  var modName, ext, templateKey, template, contents = "";

  ext = path.extname(templatePath);
  modName = path.relative(projectPath, templatePath);
  templateKey = path.basename(templatePath, ext);

  if(!validKeyTest.test(templateKey)){
    throw new PluginError(PLUGIN_NAME, 'Invalid Template name: '+templatePath+'\nTemplate file names can only use _ or alphanumeric characters.');
  }

  contents = "  // Included template file: " + modName + "\n" +
             '  "'+templateKey+'":';

  template = fs.readFileSync(templatePath, {"encoding": "utf-8"});
  template = template.replace(CR_LF, "\n");

  // remove all leading and trailing comments so they don't count against the single
  // root node rule
  if (!options.allowMultiRootTemplates) {
    template = template.replace(COMMENTS, '');
  }

  if (options.minTemplateWS) {
    template = template.replace(WS, " ");
  }

  template.split("\n").forEach(function(line, index, array) {
    line = line.trimRight();
    if (line.length > 0) {
      if (index > 0) {
        contents += "+\n";
      }

      // js escape apostrophes
      contents += " '" + line.replace(APOS, "\\'");

      if (!options.minTemplateWS && index !== array.length - 1) {
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
