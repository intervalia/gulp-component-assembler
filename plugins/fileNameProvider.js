var path = require('path');
var PluginError = require('gulp-util').PluginError;


function preAssembly(params) {
  return "var __FILE__;\nvar __ASSEMBLY__ = '"+path.basename(params.projectPath)+"';";
}

function preFile(params) {
  return "__FILE__ = '"+params.fileName+"';";
}

module.exports = function(register, types) {
  register(preAssembly, types.BEFORE_ASSEMBLY, 'fileNameProvider');
  register(preFile, types.BEFORE_JS_FILE, 'fileNameProvider');
};
module.exports.version = "2.0.0";