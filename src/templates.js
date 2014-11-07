var fs = require('fs');
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var validKeyTest = /^[a-zA-Z_][0-9a-zA-Z_]*$/;

function processTemplates(templatePath, hasTranslations, options) {
  var contents = "", addComma = false;
  //console.log(" templates in:", templatePath);
  if (fs.existsSync(templatePath)) {
    templates = fs.readdirSync(templatePath);
    if (templates.length > 0) {
      contents += "\nvar templateList = {\n";

      templates.forEach(function(fileName, index) {
        if (addComma) {
          contents += ',\n';
        }
        else {
          addComma = true;
        }
        contents += processOneTemplate(path.join(templatePath, fileName), options);
      });

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
  }

  return contents;
}

function processOneTemplate(templatePath, options) {
  var modName, ext, templateKey, template, contents = "";

  ext = path.extname(templatePath);
  if (ext === ".html") {
    modName = path.basename(templatePath);
    templateKey = path.basename(templatePath, ext);

    if(!validKeyTest.test(templateKey)){
      throw new PluginError(PLUGIN_NAME, 'Invalid Template name: '+templatePath+'\nTemplate file names can only use _ or alphanumeric characters.');
    }

    contents = " // Included template file: " + modName + "\n" +
               ' "'+templateKey+'":';

    template = fs.readFileSync(templatePath, {"encoding": "utf-8"});
    template = template.replace(/(\r*\n+)+/g, "\n");
    if (options.minTemplateWS) {
      template = template.replace(/\s+/g, " ");
    }
    var lines = template.split("\n");
    lines.forEach(function(line, index) {
      line = line.trimRight();
      if (line.length > 0) {
        if (index > 0) {
          contents += "+\n";
        }

        contents += " '" + line.replace(/'/g, "\\'");
        if (!options.minTemplateWS) {
          contents += "\\n";
        }
        contents += "'";
      }
    });
  }
  else {
    throw new PluginError(PLUGIN_NAME, 'Invalid Template name: '+templatePath+'\nTemplate file names end with ".html".');
  }

  return contents;
}

module.exports = {
  "process": processTemplates
};
