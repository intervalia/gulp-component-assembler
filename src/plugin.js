var inlinePrePluginList = [];
var inlinePostPluginList = [];
var filePrePluginList = [];
var filePostPluginList = [];
var prePluginList = [];
var postPluginList = [];

var pluginTypes = {
      "INLINE_PRE": "INLINE_PRE",
      "INLINE_POST": "INLINE_POST",
      "PRE": "PRE",
      "POST": "POST",
      "FILE_PRE": "FILE_PRE",
      "FILE_POST": "FILE_POST"
    };
var pluginListByType = {
      "INLINE_PRE": inlinePrePluginList,
      "INLINE_POST": inlinePostPluginList,
      "FILE_PRE": filePrePluginList,
      "FILE_POST": filePostPluginList,
      "PRE": prePluginList,
      "POST": postPluginList
    };


function addPlugin(pluginType, process) {
  if (pluginTypes.hasOwnProperty(pluginType)) {
    pluginListByType[pluginType].push({
      "pluginType": pluginType,
      "process": process
    });
  }
  else {
    throw new Error("Invalid plug-in Type: "+pluginType);
  }
}

function processPlugin(pluginList, params) {
  var content = "";

  if (pluginList.length > 0) {
    pluginList.forEach(function(plugin, index) {
      if (typeof plugin.process === "function") {
        content += plugin.process(params);
      }
    });
  }

  return content;
}

function processInlinePrePlugins(params) {
  return processPlugin(inlinePrePluginList, params);
}

function processInlinePostPlugins(params) {
  return processPlugin(inlinePostPluginList, params);
}

function processFilePrePlugins(params) {
  return processPlugin(filePrePluginList, params);
}

function processFilePostPlugins(params) {
  return processPlugin(filePostPluginList, params);
}

function processPrePlugins(params) {
  return processPlugin(prePluginList, params);
}

function processPostPlugins(params) {
  return processPlugin(postPluginList, params);
}

module.exports = {
  "addPlugin": addPlugin,
  "processInlinePre": processInlinePrePlugins,
  "processInlinePost": processInlinePostPlugins,
  "processFilePre": processFilePrePlugins,
  "processFilePost": processFilePostPlugins,
  "processPre": processPrePlugins,
  "processPost": processPostPlugins,
  "TYPE": pluginTypes
};
