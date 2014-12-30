var path = require('path');
var PluginError = require('gulp-util').PluginError;

var preAssemblyCalled = false;

function preAssembly(params) {
  var output = "";
  if (!preAssemblyCalled) {
    preAssemblyCalled = true;
    output += "var __FILE__;\nvar ";
  }

  output += "__ASSEMBLY__ = '"+path.basename(params.projectPath)+"';\n";
  return output;
}


function preFile(params) {
  if (!preAssemblyCalled) {
    throw new PluginError("fileNameProvider", "You must process `preAssembly` before you can process `preFile`." );
  }

  return "__FILE__ = '"+params.fileName+"';\n";
}

module.exports = {
  version: "1.0.0",
  preAssembly: preAssembly,
  preFile: preFile
};
