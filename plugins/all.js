var path = require('path');
var PluginError = require('gulp-util').PluginError;


function info(params, type) {
  return "console.log('plugin code called for `"+type+"`');";
}

module.exports = function(register, types) {
  register(info, types.BEFORE, 'all.BEFORE');
  register(info, types.BEFORE_ASSEMBLY, 'all.BEFORE_ASSEMBLY');
  register(info, types.BEFORE_JS_FILE, 'all.BEFORE_JS_FILE');
  register(info, types.AFTER_JS_FILE, 'all.AFTER_JS_FILE');
  register(info, types.AFTER_ASSEMBLY, 'all.AFTER_ASSEMBLY');
  register(info, types.AFTER, 'all.AFTER');
};
module.exports.version = "1.0.0";
