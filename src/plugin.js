var inlinePluginList = [];
var prePluginList = [];
var postPluginList = [];
var pluginTypes = {
      "INLINE": "INLINE",
      "PRE": "PRE",
      "POST": "POST"
    };

function addPlugin(pluginType, process) {
  inlinePluginList.push({
    "pluginType": pluginType,
    "process": process
  });
}

function processPlugin(pluginType, pluginList, params) {
  var content = "";

  if (pluginList.length > 0) {
    //content = "\n// " + pluginType + JSON.stringify(params) + "\n";

    pluginList.forEach(function(plugin, index) {
      //content += "\n// Plugin " + JSON.stringify(plugin) + "\n";
      content += "\n// " + index;
      content += "\n// " + typeof plugin.process;
      content += "\n// " + JSON.stringify(plugin.process);
      if (typeof plugin.process === "function") {
        content += plugin.process(params);
      }
    });
  }

  return content;
}

function processInlinePlugins(params) {
  return processPlugin(pluginTypes.INLINE, inlinePluginList, params);
}

function processPrePlugins(params) {
  return processPlugin(pluginTypes.PRE, prePluginList, params);
}

function processPostPlugins(params) {
  return processPlugin(pluginTypes.POST, postPluginList, params);
}

module.exports = {
  "addPlugin": addPlugin,
  "processInline": processInlinePlugins,
  "processPre": processPrePlugins,
  "processPost": processPostPlugins,
  "TYPE": pluginTypes
};
