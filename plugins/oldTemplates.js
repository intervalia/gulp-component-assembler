var fs = require('fs');
var path = require('path');

function extractBody(html) {
  return html.replace(/\r*\n/g, "\x1f").replace(/(.*)<body[^>]*>(.*)<\/body>(.*)/gi, "$2").replace(/\x1f/g, "\n").trim();
}

function processOneOldTemplate(templatePath, options) {
  var lines;
  var skipping = false;
  var hadData = false;
  var contents = "/*\n * Included File: template.html\n */\nvar snippetsRaw =";
  if (options.minTemplateWS) {
    contents += " '";
  }
  var template = extractBody(fs.readFileSync(templatePath, {"encoding": "utf-8"}));
  lines = template.split("\n");
  lines.forEach(function(line, index) {
    line = line.trimRight();
    if (line.indexOf('<!-- exclude START -->') > -1) {
      skipping = true;
    }
    if (!skipping && line.trim().length > 0 && line.indexOf("<!-- exclude LINE -->") === -1) {
      if (!options.minTemplateWS && hadData > 0) {
        contents += "+\n";
      }
      if (options.minTemplateWS) {
        if (hadData > 0) {
          line = " "+line;
        }
        contents += (line.replace(/'/g, "\\'").replace(/\s+/g, " "));
      }
      else {
        contents += "'" + line.replace(/'/g, "\\'")+"\\n'";
      }
      hadData = true;
    }
    if (line.indexOf('<!-- exclude END -->') > -1) {
      skipping = false;
    }
  });
  if (options.minTemplateWS) {
    contents += "'";
  }
  contents += ";\n";

  return hadData ? contents : "";
}

function processOldTemplates(templatePath, hasTranslations, options) {
  var contents = "";
  //console.log(" template file:", templatePath);
  if (fs.existsSync(templatePath)) {
    contents += processOneOldTemplate(templatePath, options);

    contents += '\n\nfunction getSnippets() {'+
                '\n var snip = document.createElement("div");';
    if (hasTranslations) {
      contents += '\n $(snip).html(snippetsRaw.format(lang));';
    }
    else {
      contents += '\n $(snip).html(snippetsRaw);';
    }
    contents += '\n return snip;\n}\n';
  }

  return contents;
}

function pluginProcess(params) {
  return processOldTemplates(path.join(params.projectPath, "template.html"), params.hasTranslations, params.options);
}

module.exports = pluginProcess;
module.exports.version = "1.0.0";
