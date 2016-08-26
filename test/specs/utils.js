/*jshint expr: true*/
/*jshint -W079 */
/*jshint -W121 */

var cheerio = require('cheerio');

// shim DOM Node
var document = {
  createElement: function(name) {
    var $ = cheerio.load('<' + name + '>');

    Object.defineProperties($, {
      'innerHTML': {
        set: function(html) {
          $(name).append(html);
        }
      },
      'children': {
        get: function() {
          return $(name).eq(0).children();
        }
      },
      'firstChild': {
        get: function() {
          return $(name).eq(0);
        }
      }
    });

    return $;
  }
};

// shim String.format
String.prototype.format = function() {
  var args = arguments;
  var text = this;

  text = text.replace(/\{(\d)\}/g, function(match, p1) {
    return args[p1];
  });

  return text;
};

var pluginMock = {
  plugins: {},
  resetPlugins: function() {
    pluginMock.plugins = {};
  },
  register: function(process, type, name) {
    pluginMock.plugins[type] = pluginMock.plugins[type] || [];
    pluginMock.plugins[type].push({name: name, process: process});
  },
  types: {
    "BEFORE": "BEFORE",
    "BEFORE_ASSEMBLY": "BEFORE_ASSEMBLY",
    "BEFORE_JS_FILE": "BEFORE_JS_FILE",
    "AFTER_JS_FILE": "AFTER_JS_FILE",
    "AFTER_ASSEMBLY": "AFTER_ASSEMBLY",
    "AFTER": "AFTER"
  },
  process: function(type, params) {
    var contents = '';

    pluginMock.plugins[type].forEach(function(plugin) {
      var content = plugin.process(params);

      if (content) {
        contents += content;
      }
    });

    return contents;
  }
};

var FSMock = {
  i18nFormat: function(string) { return string; }
};

module.exports.document = document;
module.exports.pluginMock = pluginMock;
module.exports.FSMock = FSMock;