/*jshint -W079 */
/*jshint -W083 */
/*jshint -W041 */

var chokidar = require('chokidar');
var path = require('path');
var touch = require("touch");
var fs = require('fs');
var globArray = require("./globArray");
var plugin = require('./plugin');
var glob = require('glob');
var Promise = require("native-promise-only");
var EventEmitter = require("events").EventEmitter;
var touchEvents = new EventEmitter();
var fileWatcher;

// Each file will be tracked via an object. The key will be the path of the file and the value
// will be an array of assembly paths (in case the file belongs to multiple assemblies). When a
// file changes, it will be looked up in the object and each assembly will be "touched" to
// reactivate a rebuild. When the watcher fires, we lookup the file and build
// the associated assemblies
var watchedFiles = {};

// Chokidar will fire a changed event twice for a file sometimes, possibly due to the
// system creating a backup of the file and touching it. We'll create a cache of when
// the last time the file was touched and prevent it from firing the 'alltouched' event
// if the file was changed within the last half second
// @see https://github.com/paulmillr/chokidar/issues/298
var lastChanged = {};

// Boolean state that plugins and other files can use to determine if they can add files or
// assemblies to be watched during the assemble task
var watchStarted = false;

// Keep track of how many files need to be touched and how many files have been touched to know
// exactly when to fire a single event for the gulp task to run (since a single file can propagate
// and change multiple assemblies). When a file changes, it will add the number of parent
// assemblies it belongs to the filesToTouch count. After a file has finished touching all it's
// parents assemblies, it will increment the touchedFiles by 1. When touchedFiles equals
// filesToTouch, we know we have finished touching all assemblies and can fire the event.
var filesToTouch = 1;  // always count the staring file
var touchedFiles = 0;

var assemblyRegex = /\/assembly.json$/;

/**
 * Get information from the assembly such as locale files and paths.
 * @private
 * @param {string} assemblyPath - Path to the assembly file.
 * @param {object} [assembly] - Assembly to be watched.
 * @param {function} callback - Callback function.
 */
function getAssemblyDetails(assemblyPath, assembly, callback) {
  try {
    assembly = assembly || JSON.parse(fs.readFileSync(assemblyPath, 'utf-8'));
  }
  catch (err) {
    return callback(err);
  }

  var projectPath = path.dirname(assemblyPath);

  var localeFileName = assembly.localeFileName || "strings";
  var localePathName = assembly.localePath || "locales";
  var localeFiles = globArray(["./" + localePathName + "/" + localeFileName + "_*.json"], {cwd: projectPath, root: process.cwd()});

  if (localeFiles.length === 0 && localeFileName === "strings") {
    localeFileName  = path.basename(projectPath);
    localeFiles = globArray(["./" + localePathName + "/" + localeFileName + "_*.json"], {cwd: projectPath, root: process.cwd()});
  }

  return callback(null, {
    projectPath: projectPath,
    localeFileName: localeFileName,
    localePathName: localePathName,
    localeFiles: localeFiles,
    assembly: assembly
  });
}

/**
 * Get plugin parameters.
 * @private
 * @param {string} assemblyPath - Path to the assembly file.
 * @param {object} [assembly] - Assembly to be watched.
 * @returns {object}
 */
function getPluginParameters(assemblyPath, assembly) {
  return getAssemblyDetails(assemblyPath, assembly, function(err, details) {
    if (err) {
      return {};
    }

    return {
      "projectPath": details.projectPath,
      "hasTranslations": details.localeFiles.length > 0,
      "options": {},
      "assembly": details.assembly,
      "assemblyName": assemblyPath,
      "assemblyFileName": path.basename(details.projectPath),
    };
  });
}

/**
 * Get all files that are part of an assembly build.
 * @private
 * @param {string} assemblyPath - Path to the assembly file.
 * @param {object} [assembly] - Assembly to be watched.
 * @returns {string[]}
 */
function getAssemblyFiles(assemblyPath, assembly) {
  var files = [];

  return getAssemblyDetails(assemblyPath, assembly, function(err, details) {
    if (err) {
      return files;
    }

    files = files.concat(globArray(details.assembly.files, {cwd: details.projectPath, root: process.cwd()}));
    files = files.concat(details.localeFiles);
    files = files.concat(globArray(details.assembly.templates || ["./templates/*.html"], {cwd: details.projectPath, root: process.cwd()}));

    return files;
  });
}

/**
 * Touch any assembly file whose file has changed.
 * @param {string} event - Name of the event type.
 * @param {string} file - File path of the file that changed.
 */
function fileChanged(event, file) {
  file = path.resolve(process.cwd(), file);  // make sure it's the absolute path
  var fileDir = path.dirname(file);
  var watchedPaths = fileWatcher.getWatched();
  var promises = [];

  // only process files that have changed more than a 0.5 seconds ago
  if (lastChanged[file] && new Date() - lastChanged[file] < 500) {
    return;
  }
  else {
    lastChanged[file] = new Date();
  }

  // Assembly.json file was changed
  if (assemblyRegex.test(file)) {

    // Assembly changed or added that we weren't aware of
    if (event === 'change' || event === 'add') {

      // Ensure all files that are part of the assembly have been added
      getAssemblyFiles(file).forEach(function(assemblyFile) {
        if (!watchedFiles[assemblyFile]) {
          watchedFiles[assemblyFile] = [file];
          fileWatcher.add(assemblyFile);
        }
      });

      // Watch the assembly directory or file
      if (!watchedPaths[fileDir]) {
        fileWatcher.add(fileDir);
      }
      else if (!watchedPaths[fileDir][path.basename(file)]) {
        fileWatcher.add(file);
      }

      // Touch all super assemblies that this assembly belongs to
      if (watchedFiles[file]) {
        filesToTouch += watchedFiles[file].length;

        watchedFiles[file].forEach(function(assembly) {
          promises.push(new Promise(function(resolve, reject) {
            touch(assembly, function() {
              resolve();
            });
          }));
        });
      }
    }

    // Assembly deleted, remove all references to it
    if (event === 'unlink') {

      // Remove references to the watched assembly but don't unwatch it
      delete watchedFiles[file];

      // Because the assembly file no longer exists we can't read it to know which files belong
      // to it, so we'll have to work backwards to remove references to it
      for (var assemblyFile in watchedFiles) {
        if (!watchedFiles.hasOwnProperty(assemblyFile)) {
          continue;
        }

        if (watchedFiles[assemblyFile].indexOf(file) !== -1) {
          delete watchedFiles[assemblyFile];
        }
      }
    }
  }

  // New file added that we weren't aware of
  else if (event === 'add' && !watchedFiles[file]) {
    var assemblyPath = path.join(fileDir, 'assembly.json');

    // Since we only know the file path of the file that was added, the best we can do is
    // search for an assembly.json file in its parent folders, and check to see if the file
    // added is part of that assembly
    while(fileDir.replace(/\/$/,'') !== process.cwd()) {

      try {
        // Test to see if this file belongs to this assembly
        if (getAssemblyFiles(assemblyPath).indexOf(file) !== -1) {
          watchedFiles[file] = [assemblyPath];
          filesToTouch++;

          promises.push(new Promise(function(resolve, reject) {
            touch(assemblyPath, function() {
              resolve();
            });
          }));

          break;
        }
        // File doesn't belong to this assembly so keep searching
        else {
          fileDir = path.join(fileDir, '../');
          assemblyPath = path.join(fileDir, 'assembly.json');
        }
      } catch (e) {
        fileDir = path.join(fileDir, '../');
        assemblyPath = path.join(fileDir, 'assembly.json');
      }
    }
  }

  // File updated, touch the assembly
  else if (event === 'change' && watchedFiles[file]) {
    filesToTouch += watchedFiles[file].length;

    watchedFiles[file].forEach(function(assembly) {
      promises.push(new Promise(function(resolve, reject) {
        touch(assembly, function() {
          resolve();
        });
      }));
    });
  }

  // File deleted, touch the assembly and remove the file from the files list
  else if(event === 'unlink' && watchedFiles[file]) {
    filesToTouch += watchedFiles[file].length;

    watchedFiles[file].forEach(function(assembly) {
      promises.push(new Promise(function(resolve, reject) {
        touch(assembly, function() {
          resolve();
        });
      }));
    });

    // Remove references to the file but don't unwatch it
    delete watchedFiles[file];
  }

  // Add events always fire a change event for the same file, so we'll ignore add events
  if (event !== 'add') {
    // The file is done touching any parent files
    Promise.all(promises).then(function() {
      touchedFiles++;

      // fire the event once all filesToTouch and have been touched
      if (filesToTouch > 0 && touchedFiles === filesToTouch) {

        filesToTouch = 1;  // always count the staring file
        touchedFiles = 0;
        touchEvents.emit('allTouched');
      }
    });
  }
}

/**
 * Add a file to be watched.
 * @param {string} filePath - Path to the file to watch.
 * @param {string} assemblyPath - Path of the assembly the file is associated with.
 */
function addFile(filePath, assemblyPath) {
  if (!fileWatcher) {
    return;
  }

  var absoluteFilePath = path.resolve(process.cwd(), filePath);
  var absoluteAssemblyPath = path.resolve(process.cwd(), assemblyPath);

  var fileDir = path.dirname(absoluteFilePath);
  var assemblyDir = path.dirname(absoluteAssemblyPath);

  var assemblies = watchedFiles[absoluteFilePath];

  // Add the file only if it isn't an assembly.json file. If an assembly.json file was added,
  // it would cause an infinite loop as it would cause changes to the assembly.json to touch the
  // assembly.json, which would cause it to change, which would cause it to be touched, etc.
  if (!assemblies && !assemblyRegex.test(absoluteFilePath)) {
    watchedFiles[absoluteFilePath] = [absoluteAssemblyPath];
    fileWatcher.add(absoluteFilePath);
  }
  // File is included in multiple assemblies
  else if (assemblies.indexOf(absoluteAssemblyPath) === -1) {
    assemblies.push(absoluteAssemblyPath);
  }
}

/**
 * Add an assembly to be watched.
 * @param {string} assemblyPath - Path to the assembly file.
 */
function addAssembly(assemblyPath) {
  if (!fileWatcher) {
    return;
  }

  var absoluteAssemblyPath = path.resolve(process.cwd(), assemblyPath);
  var assemblyDir = path.dirname(absoluteAssemblyPath);
  var assembly;

  fileWatcher.add(assemblyDir);

  try {
    assembly = JSON.parse(fs.readFileSync(absoluteAssemblyPath, 'utf-8'));
  } catch(err) {
    // If the file could not be read or the parse failed, then we will just not watch
    // that assembly
    return;
  }

  /*
    Run plugins as they might change the assembly state or add new files to be watched. Because
    we don't have any options available to pass the plugins, this still isn't guaranteed to add
    every possible file to be watched, but it will get us as close as possible.
   */
  // Run any BEFORE and BEFORE_ASSEMBLY plugins
  plugin.process(plugin.types.BEFORE, getPluginParameters(assemblyPath, assembly));
  plugin.process(plugin.types.BEFORE_ASSEMBLY, getPluginParameters(assemblyPath, assembly));

  // Watch all assembly files
  getAssemblyFiles(assemblyPath, assembly).forEach(function(file) {
    addFile(file, assemblyPath);
  });

  // Link any sub assemblies
  if (assembly.subs) {
    assembly.subs.forEach(function(subAssembly) {
      var absoluteSubAssemblyPath = path.resolve(assemblyDir, subAssembly);
      addAssembly(absoluteSubAssemblyPath);

      var assemblies = watchedFiles[absoluteSubAssemblyPath];

      // Assembly has not been added
      if (!assemblies) {
        watchedFiles[absoluteSubAssemblyPath] = [absoluteAssemblyPath];
      }
      // Assembly is included in multiple assemblies
      else if (assemblies.indexOf(absoluteAssemblyPath) === -1) {
        assemblies.push(absoluteAssemblyPath);
      }
    });
  }

}

/**
 * What a list of assembly files for changes. Modified from gulp 4.0.
 * @see https://github.com/gulpjs/gulp/blob/4.0/index.js
 * @param {string|string[]} glob - List of glob assembly patterns.
 * @param {object} opt - Options passed to chokidar.
 * @param {function} task - Function to call when the assembly changes.
 */
function watch(patterns, opt, task) {
  // This is the only way to turn on watching
  watchStarted = true;
  patterns = (!Array.isArray(patterns) ? [patterns] : patterns);

  if (typeof opt === 'string' || typeof task === 'string' ||
    Array.isArray(opt) || Array.isArray(task)) {
    throw new Error('watching ' + patterns + ': watch task has to be ' +
      'a function (optionally generated by using gulp.parallel ' +
      'or gulp.series)');
  }

  if (typeof opt === 'function') {
    task = opt;
    opt = {};
  }

  opt = opt || {};

  // Don't fire the add event for the initial watching of the assembly
  if (opt.ignoreInitial == null) {
    opt.ignoreInitial = true;
  }

  // Watch the assemblies for changes
  var watcher = chokidar.watch(patterns, opt);
  if (task) {
    watcher.on('add', function(file) {
      fileChanged('add', file);
    });

    // Only fire the change and unlink events once for all touched assemblies
    // (since a single file can touch multiple assembly files)
    touchEvents.on('allTouched', task);
  }

  // chokidar needs a file to watch first before you can get the FSWatcher instance, so we'll
  // watch a fake path at first just to get it started
  fileWatcher = chokidar.watch('/path/to/fake/file.blah', {ignoreInitial: true});
  fileWatcher.on('all', fileChanged);

  // Watch all files in the assembly
  patterns.forEach(function(pattern, index) {
    glob(pattern, function(err, matches) {
      matches.forEach(function(assemblyPath) {
        addAssembly(assemblyPath);
      });
    });
  });
}

module.exports = {
  "addFile": addFile,
  "addAssembly": addAssembly,
  "watch": watch
};