/*jshint expr: true*/
/*jshint -W061 */

var oldSubAssemblies = require('../../plugins/oldSubAssemblies');
var path = require('path');
var should = require('should');
var pluginMock = require('./utils').pluginMock;


describe('\n    Testing the plugin oldSubAssemblies.js', function () {
  var rootPath = path.resolve(".");
  var assembly, pluginParams;

  var finalAssembly = {
    files: ['one', 'two'],
    subs: ['../sub1/assembly.json', '../../sub2/assembly.json']
  };

  beforeEach(function() {
    assembly = {
      files: ['one', 'two'],
      assemblies: ['../sub1', '../../sub2']
    };

    pluginParams = {
      assembly: assembly
    };
  });

  /*
   * Test function: oldSubAssemblies
   *
   */
  it('should transform the "assemblies" property to "subs"', function() {
    oldSubAssemblies(pluginMock.register, pluginMock.types);

    pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams);

    should.deepEqual(finalAssembly, assembly);
  });

});