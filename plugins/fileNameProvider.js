var path = require('path');


function preAssembly(params) {
  return "var __FILE__;\nvar __ASSEMBLY__ = '"+path.basename(params.projectPath)+"';";
}

function preFile(params) {
  return "__FILE__ = '"+params.fileName+"';";
}

module.exports = function(register, types) {
  register(preAssembly, types.BEFORE_ASSEMBLY, 'fileNameProvider.BEFORE_ASSEMBLY');
  register(preFile, types.BEFORE_JS_FILE, 'fileNameProvider.BEFORE_JS_FILE');
};
module.exports.version = "2.0.0";
