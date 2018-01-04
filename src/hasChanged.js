var fs = require('fs');
var path = require('path');
var PluginError = require('plugin-error');

function compareLastModifiedTime(stream, cb, basePath, sourceFile, targetPath) {
  if (sourceFile.isNull()) {
    cb(null, sourceFile);
    return;
  }

  fs.stat(targetPath, function(err, targetStat) {
    if (err) {
      if (err.code === 'ENOENT') {
        // try reading the file using the oldDest path
        var target = path.join(basePath, path.basename(basePath)+'.js');

        if (target !== targetPath) {
          return compareLastModifiedTime(stream, cb, basePath, sourceFile, target);
        }
        else {
          stream.push(sourceFile);
        }
      }
      else {
        stream.emit('error', new PluginError('gulp-changed', err, {
          fileName: sourceFile.path
        }));

        stream.push(sourceFile);
      }
    }

    // file changed
    else if (sourceFile.stat.mtime > targetStat.mtime) {
      stream.push(sourceFile);
    }

    cb();
  });
}

/**
 * Use in conjunction with gulp-changed to properly compare the assembly.json file
 * to it's output file.
 * @see https://github.com/sindresorhus/gulp-changed#haschanged
 */
module.exports = function (stream, cb, sourceFile, targetPath) {
  var basePath = path.dirname(targetPath);
  targetPath = path.join(path.dirname(basePath), path.basename(basePath)+'.js');

  compareLastModifiedTime(stream, cb, basePath, sourceFile, targetPath);
};
