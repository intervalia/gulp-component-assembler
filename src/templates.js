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
        contents += ',\n\n';
      }
      else {
        contents += "var templateList = {\n";
        templatesLoaded = true;
      }

      contents += processOneTemplate(projectPath, templatePath, options);
    });
  }

  if (templatesLoaded) {
    if(options.useExternalLib) {
      contents += '\n};\n\nfunction getTemplateStr(key) {\n' +
                  '  // Emulate the internal getTemplateStr function by calling the external function\n'+
                  '  return __gca_getTemplateStr(templateList, key'+(hasTranslations?', lang':'')+');\n' +
                  '}';
    }
    else {
      contents += '\n};\n\nfunction getTemplateStr(key) {\n' +
                  '  if (!templateList[key]) {\n' +
                  '    console.warn("No template named \'" + key + "\'");\n' +
                  '  }\n';
      if (hasTranslations) {
        // __gca_formatStr is Added when locales are added (locales.js)
        contents += '\n  return __gca_formatStr(templateList[key] || "", lang);\n}\n\n'+
                    'var __gca_formatStrRe = /\{([^}]+)\}/g;\n'+
                    'function __gca_formatStr(txt, obj) {\n'+
                      'var potentialSubstitutionsRegex = /\{+?[^{\\n\\r]+\}/g;\n'+
                      'var trueSubstitutionsRegex = /^\{([^{}]+)\}/;\n'+

                      'if (typeof obj !== "object") {\n'+
                        'obj = Array.prototype.slice.call(arguments, 1);\n'+
                      '}\n'+

                      'return txt.replace(potentialSubstitutionsRegex, function (fullKey) {\n'+
                        'return fullKey.replace(trueSubstitutionsRegex, function(match, key) {\n'+
                          'var ObjArray = key.split(".");\n'+
                          'var len = ObjArray.length;\n'+
                          'var tempObj = obj;\n'+
                          'for (var i = 0; i < len; i++) {\n'+
                            'tempObj = tempObj[ObjArray[i]];\n'+
                            'if (!tempObj) {\n'+
                              'return match;\n'+
                            '}\n'+
                          '}\n'+
                          'return tempObj;\n'+
                        '});\n'+
                      '});\n'+
                    '}';
      } else {
        contents += '\n  return templateList[key] || "";\n}';
      }
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
  var modName, ext, templateKey, template, preSpace = "", contents = "";

  ext = path.extname(templatePath);
  modName = path.relative(projectPath, templatePath);
  templateKey = path.basename(templatePath, ext);

  if(!validKeyTest.test(templateKey)){
    throw new PluginError(PLUGIN_NAME, 'Invalid Template name: '+templatePath+'\nTemplate file names can only use _ or alphanumeric characters.');
  }

  contents = "  // Included template file: " + modName + "\n" +
             '  "'+templateKey+'":';
  preSpace = "";
  for(var q = templateKey.length+5; q > 0; q--) {
    preSpace += " ";
  }


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

      if (!options.minTemplateWS && index > 0) {
        contents += preSpace;
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
