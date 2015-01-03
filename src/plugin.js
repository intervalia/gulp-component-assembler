var inlinePrePluginList;
var inlinePostPluginList;
var filePrePluginList;
var filePostPluginList;
var prePluginList;
var postPluginList;
var pluginListByType;
var pluginTypes = {
      "INLINE_PRE": "INLINE_PRE",
      "INLINE_POST": "INLINE_POST",
      "PRE": "PRE",
      "POST": "POST",
      "FILE_PRE": "FILE_PRE",
      "FILE_POST": "FILE_POST"
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

function clear() {
  inlinePrePluginList = [];
  inlinePostPluginList = [];
  filePrePluginList = [];
  filePostPluginList = [];
  prePluginList = [];
  postPluginList = [];
  pluginListByType = {
    "INLINE_PRE": inlinePrePluginList,
    "INLINE_POST": inlinePostPluginList,
    "FILE_PRE": filePrePluginList,
    "FILE_POST": filePostPluginList,
    "PRE": prePluginList,
    "POST": postPluginList
  };
}

function processPlugin(pluginList, params) {
  var content = "", temp;

  if (pluginList.length > 0) {
    pluginList.forEach(function(plugin, index) {
      if (typeof plugin.process === "function") {
        temp = plugin.process(params);
        //if (temp !== undefined) {
          content += temp;
        //}
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

clear();

module.exports = {
  "addPlugin": addPlugin,
  "clear": clear,
  "processInlinePre": processInlinePrePlugins,
  "processInlinePost": processInlinePostPlugins,
  "processFilePre": processFilePrePlugins,
  "processFilePost": processFilePostPlugins,
  "processPre": processPrePlugins,
  "processPost": processPostPlugins,
  "TYPE": pluginTypes
};
