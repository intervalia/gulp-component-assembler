var path = require('path');
var PluginError = require('gulp-util').PluginError;

var preAssemblyCalled = false;

function preAssembly(params) {
  if (!preAssemblyCalled) {
    preAssemblyCalled = true;
    return "var __ASSEMBLY__ = '"+path.basename(params.projectPath)+"';\nvar __FILE__;\n";
  }
  return "__ASSEMBLY__ = '"+path.basename(params.projectPath)+"';\n";
}


function preFile(params) {
  if (!preAssemblyCalled) {
    throw new PluginError("fileNameProvider", "You must process `preAssembly` before you can process `preFile`." );
  }

  return "__FILE__ = '"+params.fileName+"';\n";
}

module.exports = {
  preAssembly: preAssembly,
  preFile: preFile
};
