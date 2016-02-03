var glob = require('glob');
var path = require('path');
var minimatch = require("minimatch");

function globArray(patterns, options) {
  var i, list = [];
  if (!Array.isArray(patterns)) {
    patterns = [patterns];
  }

  patterns.forEach(function (pattern) {
    if (pattern[0] === "!") {
      i = list.length-1;
      while( i > -1) {
        if (!minimatch(path.relative(options.cwd, list[i]), pattern)) {
          list.splice(i,1);
        }
        i--;
      }

    }
    else {
      var newList = glob.sync(pattern, options);

      // no files returned
      if (!newList.length) {
        // don't pass the file to the process script if it's a glob pattern
        if (!glob.hasMagic(pattern)) {
          list.push(pattern);
        }
      }

      newList.forEach(function(item){
        item = path.resolve(options.cwd, item);

        if (list.indexOf(item)===-1) {
          list.push(item);
        }
      });
    }
  });

  return list;
}

module.exports = globArray;
