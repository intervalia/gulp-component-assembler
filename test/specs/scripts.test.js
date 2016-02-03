/*jshint expr: true*/
/*jshint -W061 */

var scripts = require('../../src/scripts');
var path = require('path');
var should = require('should');


describe('\n    Testing the file scripts.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: scripts
   *
   */
  describe('Testing default options', function() {
    var projectPath = path.join(rootPath, "testdata/scriptTest/one");
    var files = [ path.join(projectPath, "test.js") ];
    var hasTranslations = false;
    var assembly = {files: files};
    var assemblyName = "one";
    var isSub = false;
    var options = {};


    it('should add the script file', function() {
      var templateList, getTemplate, getTemplateStr;

      var window = {};

      /*
        will add to scope whatever is in the script file
      */
      eval(scripts.process(projectPath, files, options, hasTranslations, assembly, assemblyName, isSub));

      should.equal(true, window.test);
    });

    it('should add script files in the order listed', function() {
      var templateList, getTemplate, getTemplateStr;

      files.push( path.join(projectPath, 'override.js') );
      var window = {};

      /*
        will add to scope whatever is in the script file
      */
      eval(scripts.process(projectPath, files, options, hasTranslations, assembly, assemblyName, isSub));

      should.equal('override', window.test);
    });

  });

});