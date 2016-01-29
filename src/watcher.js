var chokidar = require('chokidar');
var path = require('path');
var touch = require("touch");
var fs = require('fs');
var globArray = require("./globArray");

// Each file will be tracked via an object. The key will be the path of the file and the value
// will be an array of assembly paths (in case the file belongs to multiple assemblies). When a
// file changes, it will be looked up in the object and each assembly will be "touched" to
// reactivate a rebuild. Each assembly.json folder path will also be stored so we don't set up
// multiple watchers on the same directory. When the watcher fires, we lookup the file and build
// the associated assemblies
var watchedPaths = [];
var files = {};

var assemblyRegex = /\/assembly.json$/;

/**
 * Get all files that are part of an assembly build.
 * @private
 * @param {string} assemblyPath - Path to the assembly file.
 * @param {object} [assembly] - Assembly to be watched.
 * @returns {string[]}
 */
function getAssemblyFiles(assemblyPath, assembly) {
  assembly = assembly || JSON.parse(fs.readFileSync(assemblyPath, 'utf-8'));

  var projectPath = path.dirname(assemblyPath);
  var localeFileName = assembly.localeFileName || "strings";
  var localePathName = assembly.localePath || "locales";
  var localePath = path.join(projectPath, localePathName);
  var files = [];

  var localeFiles = files.concat(globArray(["./" + localePathName + "/" + localeFileName + "_*.json"], assemblyPath, {cwd: projectPath, root: process.cwd()}));

  if (localeFiles.length === 0 && localeFileName === "strings") {
    localeFileName  = path.basename(projectPath);
    localeFiles = files.concat(globArray(["./" + localePathName + "/" + localeFileName + "_*.json"], assemblyPath, {cwd: projectPath, root: process.cwd()}));
  }

  files = files.concat(globArray(assembly.files, assemblyPath, {cwd: projectPath, root: process.cwd()}));
  files = files.concat(localeFiles);
  files = files.concat(globArray(assembly.templates || ["./templates/*.html"], assemblyPath, {cwd: projectPath, root: process.cwd()}));

  // console.log('assemblyFiles:', files);

  return files;
}

/**
 * Touch any assembly file whose file has changed.
 * @param {string} event - Name of the event type.
 * @param {string} file - File path of the file that changed.
 */
function fileChanged(event, file) {
  // Assembly.json file was changed
  if (assemblyRegex.test(file)) {
    // Ignore add and unlink assembly events
    if (event === 'change') {
      var assemblyDir = path.dirname(file);
      // console.log('\nAssembly filed changed');

      // Ensure all files that are part of the assembly have been added
      getAssemblyFiles(file).forEach(function(assemblyFile) {
        if (!files[assemblyFile]) {
          // console.log('adding',assemblyFile,'to the files object');
          files[assemblyFile] = [file];

          // This file may not be part of the assembly path and might need to be watched
          var fileDir = path.dirname(assemblyFile);
          if (fileDir.indexOf(assemblyDir) !== 0 && watchedPaths.indexOf(fileDir) === -1 && watchedPaths.indexOf(assemblyFile) === -1) {
            watchedPaths.push(assemblyFile);

            chokidar.watch(assemblyFile).on('all', function(event, file) {
              fileChanged(event, file);
            });
          }
        }
      });

      // Touch all super assemblies that this assembly belongs to
      if (files[file]) {
        files[file].forEach(function(assembly) {
          // console.log('rebuilding', assembly);
          touch(assembly);
        });
      }
    }
  }

  // New file added that we weren't aware of
  else if (event === 'add' && !files[file]) {
    var fileDir = path.dirname(file);
    var assemblyPath = path.join(fileDir, 'assembly.json');

    // Since we only know the file path of the file that changed, the best we can do is
    // search for an assembly.json file in its parent folders, and check to see if the file
    // added is part of that assembly
    while(fileDir.replace(/\/$/,'') !== process.cwd()) {
      // console.log('\ncurrDir:',fileDir.replace(/\/$/,''));
      // console.log('fileDir:', fileDir);
      // console.log('assemblyPath:', assemblyPath);

      try {
        // Test to see if this file belongs to this assembly
        if (getAssemblyFiles(assemblyPath).indexOf(file) !== -1) {
          files[file] = [assemblyPath];
          // console.log('rebuilding', assemblyPath);
          touch(assemblyPath);

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
  else if (event === 'change' && files[file]) {
    files[file].forEach(function(assembly) {
      // console.log('rebuilding', assembly);
      touch(assembly);
    });
  }

  // File deleted, touch the assembly and remove the file from the files list
  else if(event === 'unlink' && files[file]) {
    files[file].forEach(function(assembly) {
      // console.log('rebuilding', assembly);
      touch(assembly);
    });

    delete files[file];
  }
}

/**
 * Add a file to be watched.
 * @param {string} filePath - Path to the file to watch.
 * @param {string} assemblyPath - Path of the assembly the file is associated with.
 */
function addFile(filePath, assemblyPath) {
  var absoluteFilePath = path.resolve(process.cwd(), filePath);
  var absoluteAssemblyPath = path.resolve(process.cwd(), assemblyPath);

  var fileDir = path.dirname(absoluteFilePath);
  var assemblyDir = path.dirname(absoluteAssemblyPath);

  var assemblies = files[absoluteFilePath];

  // Add the file only if it isn't an assembly.json file. If an assembly.json file was added,
  // it would cause an infinite loop as it would cause changes to the assembly.json to touch the
  // assembly.json, which would cause it to change, which would cause it to be touched, etc.
  if (!assemblies && !assemblyRegex.test(absoluteFilePath)) {
    files[absoluteFilePath] = [absoluteAssemblyPath];
  }
  // File is included in multiple assemblies
  else if (assemblies.indexOf(absoluteAssemblyPath) === -1) {
    assemblies.push(absoluteAssemblyPath);
  }

  // Only watch dir paths if the file is part of the assembly
  if (fileDir.indexOf(assemblyDir) === 0) {
    if (watchedPaths.indexOf(assemblyDir) === -1) {
      watchedPaths.push(assemblyDir);

      chokidar.watch(assemblyDir).on('all', function(event, file) {
        fileChanged(event, file);
      });
    }
  }

  // File is not part of the assembly folder, watch it separately
  else if (watchedPaths.indexOf(absoluteFilePath) === -1) {
    watchedPaths.push(absoluteFilePath);

    chokidar.watch(absoluteFilePath).on('all', function(event, file) {
      fileChanged(event, file);
    });
  }
}

/**
 * Add an assembly to be watched.
 * @param {string} assemblyPath - Path to the assembly file.
 * @param {object} [assembly] - Assembly to be watched.
 */
function addAssembly(assemblyPath, assembly) {
  var absoluteAssemblyPath = path.resolve(process.cwd(), assemblyPath);
  var assemblyDir = path.dirname(absoluteAssemblyPath);

  assembly = assembly || JSON.parse(fs.readFileSync(absoluteAssemblyPath, 'utf-8'));

  // Watch all assembly files
  getAssemblyFiles(assemblyPath, assembly).forEach(function(file) {
    addFile(file, assemblyPath);
  });

  // Link any sub assemblies
  if (assembly.subs) {
    assembly.subs.forEach(function(subAssembly) {
      var absoluteSubAssemblyPath = path.resolve(assemblyDir, subAssembly);
      var assemblies = files[absoluteSubAssemblyPath];

      // Assembly has not been added
      if (!assemblies) {
        files[absoluteSubAssemblyPath] = [absoluteAssemblyPath];
      }

      // Assembly is included in multiple assemblies
      else if (assemblies.indexOf(absoluteAssemblyPath) === -1) {
        assemblies.push(absoluteAssemblyPath);
      }
    });
  }

  // console.log('files:', JSON.stringify(files, null, 2));
  // console.log('watchedPaths:', watchedPaths);
  // console.log('files:', files);
}

module.exports = {
  "addFile": addFile,
  "addAssembly": addAssembly
};