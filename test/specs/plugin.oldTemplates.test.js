/*jshint expr: true*/
/*jshint -W061 */
/*jshint -W079 */

var oldTemplates = require('../../plugins/oldTemplates');
var path = require('path');
var should = require('should');
var pluginMock = require('./utils').pluginMock;
var document = require('./utils').document;
var FS = require('./utils').FSMock;


describe('\n    Testing the plugin oldTemplates.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: oldTemplates
   *
   */
  describe('Testing default options', function() {
    var finalSnippetRaw = '<div>hello</div>';

    var pluginParams = {
      projectPath: path.join(rootPath, "testdata/templateTest/oldTemplates/single"),
      hasTranslations: false,
      assemblyName: 'single',
      options: {}
    };

    beforeEach(function() {
      pluginMock.resetPlugins();
    });

    it('should create a template variable', function() {
      var snippetsRaw, getSnippets;

      oldTemplates(pluginMock.register, pluginMock.types);

      /*
        will add to scope:
          variables: snippetsRaw
          functions: getSnippets()
      */
      eval(pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams));

      should.equal(finalSnippetRaw, snippetsRaw);
    });

    it('should create a function to transform the templates into DOM', function() {
      var snippetsRaw, getSnippets;

      var finalGetSnippets = '<div><div>hello</div></div>';

      oldTemplates(pluginMock.register, pluginMock.types);

      /*
        will add to scope:
          variables: snippetsRaw
          functions: getSnippets()
      */
      eval(pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams));

      should.equal(finalGetSnippets, getSnippets().html());
    });

    it('should remove exclude START and exclude LINE wrapped DOM', function() {
      var snippetsRaw, getSnippets;
      pluginParams.projectPath = path.join(rootPath, "testdata/templateTest/oldTemplates/comments");

      var finalSnippetRaw = '<div>Foo\n  <!-- comment in the middle -->\n  <span>bar</span>\n</div>';

      oldTemplates(pluginMock.register, pluginMock.types);

      /*
        will add to scope:
          variables: snippetsRaw
          functions: getSnippets()
      */
      eval(pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams));

      should.equal(finalSnippetRaw, snippetsRaw);
    });

    it('getSnippets() should call format() on the template if translations are available', function() {
      var snippetsRaw, getSnippets;
      pluginParams.projectPath = path.join(rootPath, "testdata/templateTest/oldTemplates/format");
      pluginParams.hasTranslations = true;

      var lang = 'Hello';

      var finalSnippetRaw = '<div><div>Hello</div></div>';

      oldTemplates(pluginMock.register, pluginMock.types);

      /*
        will add to scope:
          variables: snippetsRaw
          functions: getSnippets()
      */
      eval(pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams));

      should.equal(finalSnippetRaw, getSnippets().html());
    });

  });


  describe('Testing "minTemplateWS" option', function() {
    var finalSnippetRaw = '<div>hello</div>';

    var pluginParams = {
      projectPath: path.join(rootPath, "testdata/templateTest/oldTemplates/single"),
      hasTranslations: false,
      assemblyName: 'single',
      options: {}
    };

    beforeEach(function() {
      pluginMock.resetPlugins();
    });

    it('should create a template variable', function() {
      var snippetsRaw, getSnippets;
      pluginParams.projectPath = path.join(rootPath, "testdata/templateTest/oldTemplates/comments");
      pluginParams.options.minTemplateWS = true;

      var finalSnippetRaw = '<div>Foo <!-- comment in the middle --> <span>bar</span></div>';

      oldTemplates(pluginMock.register, pluginMock.types);

      /*
        will add to scope:
          variables: snippetsRaw
          functions: getSnippets()
      */
      eval(pluginMock.process(pluginMock.types.BEFORE_ASSEMBLY, pluginParams));

      should.equal(finalSnippetRaw, snippetsRaw);
    });
  });

});