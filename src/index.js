// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var stream = require("stream");
var assemblies = require("./assemblies");
var externalFuncs = require("./externalFunctions");
var plugin = require("./plugin");

const PLUGIN_NAME = 'gulp-component-assembler';

function assemble(options) {
  "use strict";
  var assemblyStream = new stream.Transform({objectMode: true});
  var firstTime = true;
  options = options || {};
  options.locale = options.defaultLocale || "en";

  assemblyStream._transform = function(file, unused, callback) {
    var assembly = JSON.parse(file.contents);

    file.contents = new Buffer(assemblies.process(assembly, path.dirname(file.path), options));
    file.path = path.dirname(file.path) + '.js';

    this.push(file);

    if (firstTime && options.useExternalLib) {
      firstTime = false;
      var file2 = new gutil.File({
        "base": file.base,
        "cwd": file.cwd,
        "path": path.join(path.dirname(file.path), options.externalsName || "assembly-lib.js"),
        "contents": new Buffer(externalFuncs.template(options))
      });
      this.push(file2);
    }
    callback();
  };

  return assemblyStream;
}

// exporting the plugin main function
module.exports = {
  "assemble": assemble,
  "addPlugin": plugin.addPlugin,
  "pluginType": plugin.TYPE
};
