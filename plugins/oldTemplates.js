var fs = require('fs');
var path = require('path');
var watcher = require('../src/watcher');

var COMMENTS = /(<!-- exclude START -->[\s\S]*?<!-- exclude END -->)/g;

function extractBody(html) {
  return html.replace(/\r*\n/g, "\x1f").replace(/(.*)<body[^>]*>(.*)<\/body>(.*)/gi, "$2").replace(/\x1f/g, "\n").trim();
}

function processOneOldTemplate(templatePath, options) {
  var lines = [];
  var skipping = false;
  var hadData = false;
  var contents = "/*\n * Included File: template.html\n */\nvar snippetsRaw = '";

  var template = extractBody(fs.readFileSync(templatePath, {"encoding": "utf-8"}));

  // remove lines between exclude START and exclude END
  template = template.replace(COMMENTS, "");

  template.split("\n").forEach(function(line, index) {
    line = line.trimRight();

    if (line.trim().length > 0 && line.indexOf("<!-- exclude LINE -->") === -1) {
      lines.push(line.replace(/'/g, "\\'"));
      hadData = true;
    }
  });

  if (!options.minTemplateWS) {
    contents += lines.join("\\n' +\n'");
  }
  else {
    contents += lines.join('').replace(/\s+/g, " ");
  }

  contents += "';\n";

  return hadData ? contents: "";
}

function processOldTemplates(templatePath, hasTranslations, assemblyPath, options) {
  var contents = "";
  //console.log(" template file:", templatePath);
  if (fs.existsSync(templatePath)) {
    // add the template file to be watched
    watcher.addFile(templatePath, assemblyPath);

    contents += processOneOldTemplate(templatePath, options);

    contents += '\nfunction getSnippets() {'+
                '\n  var snip = document.createElement("div");';
    if (hasTranslations) {
      contents += '\n  snip.innerHTML = snippetsRaw.format(lang);';
    }
    else {
      contents += '\n  snip.innerHTML = (typeof FS.i18nFormat === "function" ? FS.i18nFormat(snippetsRaw) : snippetsRaw);';
    }
    contents += '\n  return snip;\n}';
  }

  return contents;
}

function pluginProcess(params) {
  return processOldTemplates(path.join(params.projectPath, "template.html"), params.hasTranslations, params.assemblyName, params.options);
}

module.exports = function(register, types) {
  register(pluginProcess, types.BEFORE_ASSEMBLY, 'oldTemplates');
};
module.exports.version = "3.0.0";