/*jshint expr: true*/
/*jshint -W061 */

var plugin = require('../../src/plugin');
var path = require('path');
var should = require('should');


describe('\n    Testing the file plugin.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: plugins
   *
   */
  describe('Testing default options', function() {
    var window;
    var process = function() {
      return "window.one = true;";
    };

    var myPlugin = function(register, types, options) {
      register(process, types.BEFORE, "myPlugin");
    };

    var finalPlugin = {
      name: "myPlugin",
      process: process
    };

    // clear plugin list
    beforeEach(function() {
      window = {};

      for (var type in plugin.types) {
        if (!plugin.types.hasOwnProperty(type)) { continue; }

        plugin.plugins[type] = [];
      }
    });


    it('should be able to register a plugin', function() {
      plugin._register(process, plugin.types.BEFORE, "myPlugin");

      should.deepEqual(plugin.plugins[plugin.types.BEFORE][0], finalPlugin);
    });

    it('a plugin should be able to register itself when loaded', function() {
      plugin.load(myPlugin);

      should.deepEqual(plugin.plugins[plugin.types.BEFORE][0], finalPlugin);
    });

    it('should process a plugin for content', function() {
      plugin.load(myPlugin);

      /*
        will add to scope whatever is in the plugin file
      */
      eval(plugin.process(plugin.types.BEFORE));

      should.equal(window.one, true);
    });

    it('should process multiple plugins for content', function() {
      var processTwo = function() {
        return "window.two = true;";
      };
      var myPluginTwo = function(register, types, options) {
        register(processTwo, types.BEFORE, "myPluginTwo");
      };

      plugin.load(myPlugin);
      plugin.load(myPluginTwo);

      /*
        will add to scope whatever is in the plugin file
      */
      eval(plugin.process(plugin.types.BEFORE));

      should.equal(window.one, true);
      should.equal(window.two, true);
    });

    it('_register() should throw an error for invalid plugin types', function() {
      should.throws(function() {
        plugin._register(process, 'invalid type');
      });
    });

    it('_register() should throw an error if process isn\'t a function', function() {
      should.throws(function() {
        plugin._register('process', plugin.types.AFTER);
      });
    });

    it('load() should take a string of a predefined plugin name', function() {
      should.doesNotThrow(function() {
        plugin.load('oldTemplates');
      });
    });

    it('process should throw an error for invalid plugin types', function() {
      should.throws(function() {
        plugin.process('invalid type');
      });
    });

  });

});
