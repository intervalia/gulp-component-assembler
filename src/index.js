var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var stream = require("stream");
var assemblies = require("./assemblies");
var externalFuncs = require("./externalFunctions");
var PluginError = require('gulp-util').PluginError;
var plugin = require("./plugin");
var PLUGIN_NAME = require("./pluginName");

function assemble(options) {
  "use strict";
  var assemblyStream = new stream.Transform({objectMode: true});
  var firstTime = true;
  options = options || {};
  options.locale = options.defaultLocale || "en";

  assemblyStream._transform = function(file, unused, callback) {
    var assembly, temp;
    try {
      assembly = JSON.parse(file.contents);
    }
    catch(ex) {
      callback(new PluginError(PLUGIN_NAME, "Unable to parse .json file: " + file.path));
    }

    try {
      file.contents = new Buffer(assemblies.process(assembly, file.path, options));
    } catch (err) {
      callback(new PluginError(PLUGIN_NAME, err));
    }

    temp = path.dirname(file.path);
    if (options.useOldDest) {
      file.path = path.join(temp, path.basename(temp)+'.js');
    }
    else {
      file.path = path.join(path.dirname(temp), path.basename(temp)+'.js');
    }
    this.push(file);

    if (firstTime && options.useExternalLib) {
      firstTime = false;
      var file2 = new gutil.File({
        "path": path.join(options.externalLibPath || "./", options.externalLibName || "assembly-lib.js"),
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
  "loadPlugin": plugin.load,
  "pluginTypes": plugin.types,
  "watch": require("./watcher").watch,
  "hasChanged": require("./hasChanged")
};
