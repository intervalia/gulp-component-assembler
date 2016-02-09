var types = {
  "BEFORE": "BEFORE",                    // before the entire file is processed
  "BEFORE_ASSEMBLY": "BEFORE_ASSEMBLY",  // before each assembly file is processed
  "BEFORE_JS_FILE": "BEFORE_JS_FILE",    // before each js file is processed
  "AFTER_JS_FILE": "AFTER_JS_FILE",      // after each js file is processed
  "AFTER_ASSEMBLY": "AFTER_ASSEMBLY",    // after each assembly file is processed
  "AFTER": "AFTER"                       // after the entire file is processed
};

var plugins = {};
for (var type in types) {
  if (!types.hasOwnProperty(type)) { continue; }

  plugins[type] = [];
}

/**
 * Register a plugin.
 * @private
 * @param {function} process - Plugin process function.
 * @param {string} type - Type of the plugin.
 * @param {string} name - Name of the plugin.
 */
function _register(process, type, name) {
  // the user should be able to override how the plugin gets loaded
  type = type || process.type;

  if (!types.hasOwnProperty(type)) {
    throw new Error("Invalid plug-in type: " + type);
  }

  if (typeof process !== 'function') {
     throw new Error("Plugin must return a function");
  }

  plugins[type].push({
    name: name,
    process: process
  });
}

/**
 * Load a plugin.
 * @param {string|function} process - Name of the predefined plugin or the plugins process function.
 * @param {string} [options] - Any options you want to pass to the plugins process function.
 */
function load(process, options) {
  // load a predefined plugin
  if (typeof process === 'string') {
    try {
      process = require('../plugins/' + process);
    }
    catch (error) {
      throw error;
    }
  }

  process(_register, types, options);
}

/**
 * Run each of the plugins process functions and return the string content.
 * @param {string} type - Type of plugin to process.
 * @param {object} params - Plugin parameters.
 */
function process(type, params) {
  var content = [], pluginContent;

  if (!types.hasOwnProperty(type)) {
    throw new Error("Invalid plug-in Type: " + type);
  }

  plugins[type].forEach(function(plugin, index) {
    pluginContent = plugin.process(params, type);

    if (pluginContent) {
      content.push("// Plugin: " + plugin.name + "\n" + pluginContent);
    }
  });

  // add space in between plugins
  return content.join('\n\n');
}

module.exports = {
  "load": load,
  "plugins": plugins,
  "_register": _register,
  "process": process,
  "types": types
};
