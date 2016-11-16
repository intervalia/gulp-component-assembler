/*jshint expr: true*/
/*jshint -W061 */
/*jshint -W079 */
/*jshint -W121 */

var templates = require('../../src/templates');
var path = require('path');
var should = require('should');
var cheerio = require('cheerio');
var document = require('./utils').document;


describe('\n    Testing the file templates.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: templates
   *
   */
   describe('testing nested strings', function() {
     var projectPath = path.join(rootPath, "testdata/templateTest/two");
     var _templateList = [
       path.join(projectPath, 'nestedKeyOne.html'),
       path.join(projectPath, 'nestedKeyTwo.html'),
       path.join(projectPath, 'invalid.html'),
       path.join(projectPath, 'missingTranslation.html')
     ];
     var hasTranslations = true;
     var options = {};

     var finalTemplateList = {
       "nestedKeyOne": '<button>Something</button>\n',
       "nestedKeyTwo": '<button>Something Else</button>\n',
       "invalid": '<button>{button.something.somethingElse}</button>\n',
       "missingTranslation": '<button>{button.something.somethingElse}</button><span>Something Else</span>\n'
     };

     it('should support nested strings one level deep', function() {
       var templateList, getTemplate, getTemplateStr;
       var lang = {button: {
                    something: 'Something'
                  }};
       /*
         will add to scope:
           variables: templateList
           functions: getTemplate(), getTemplateStr()
       */
       eval(templates.process(projectPath, _templateList, hasTranslations, options));

       should.equal(finalTemplateList.nestedKeyOne, getTemplateStr('nestedKeyOne'));
     });

     it('should support nested strings multiple levels deep', function() {
       var templateList, getTemplate, getTemplateStr;
       var lang = {button: {
                    something: {
                      somethingElse: "Something Else"
                    }
                  }};
       /*
         will add to scope:
           variables: templateList
           functions: getTemplate(), getTemplateStr()
       */
       eval(templates.process(projectPath, _templateList, hasTranslations, options));

       should.equal(finalTemplateList.nestedKeyTwo, getTemplateStr('nestedKeyTwo'));
     });

     it('should return original text if key does not exist', function() {
       var templateList, getTemplate, getTemplateStr;
       var lang = {button: {
                    anything: {
                      somethingElse: "Something Else"
                    }
                  }};
       /*
         will add to scope:
           variables: templateList
           functions: getTemplate(), getTemplateStr()
       */
       eval(templates.process(projectPath, _templateList, hasTranslations, options));

       should.equal(finalTemplateList.invalid, getTemplateStr('invalid'));
     });

     it('should replace all translations even when translations are missing', function() {
       var templateList, getTemplate, getTemplateStr;
       var lang = {button: {
                    anything: {
                      somethingElse: "Something Else"
                    }
                  }};
       /*
         will add to scope:
           variables: templateList
           functions: getTemplate(), getTemplateStr()
       */
       eval(templates.process(projectPath, _templateList, hasTranslations, options));

       should.equal(finalTemplateList.missingTranslation, getTemplateStr('missingTranslation'));
     });

   });
  describe('Testing default options', function() {
    var projectPath = path.join(rootPath, "testdata/templateTest/one");
    var _templateList = [
      path.join(projectPath, 'single.html'),
      path.join(projectPath, 'nested.html')
    ];
    var hasTranslations = false;
    var options = {};

    var finalTemplateList = {
      "single": '<div>hello</div>',
      "nested": '<div>\n  <span>\n    <a href="#"><span>Click Me!</span></a>\n  </span>\n</div>'
    };


    it('should create a list of templates', function() {
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.deepEqual(finalTemplateList, templateList);
    });

    it('should create a function to access the template strings', function() {
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.equal(finalTemplateList.single, getTemplateStr('single'));
      should.equal(finalTemplateList.nested, getTemplateStr('nested'));
    });

    it('should create a function to transform the templates into DOM', function() {
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.equal(finalTemplateList.single, getTemplate('single').html());
      should.equal(finalTemplateList.nested, getTemplate('nested').html());
    });

    it('should remove comments from beginning and ending of a template', function() {
      var _templateList = [
        path.join(projectPath, 'comments.html')
      ];
      var templateList, getTemplate, getTemplateStr;

      var finalTemplateList = {
        "comments": '<div>Foo\n  <!-- comment in the middle -->\n  <span>bar</span>\n</div>'
      };

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.deepEqual(finalTemplateList, templateList);
    });

    it('getTemplate() should throw an error if the template has more than one root node', function() {
      var _templateList = [
        path.join(projectPath, 'multiroot.html')
      ];
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.throws(function() {
        getTemplate('multiroot');
      });
    });

    it('getTemplateStr() should call format() on the template if translations are available', function() {
      var _templateList = [
        path.join(projectPath, 'format.html')
      ];
      var hasTranslations = true;
      var templateList, getTemplate, getTemplateStr;
      var lang = 'Hello';

      var finalFormatStr = '<div>Hello</div>';

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.equal(finalFormatStr, getTemplateStr('format'));
    });

  });


  describe('Testing "minTemplateWS" option', function() {
    var projectPath = path.join(rootPath, "testdata/templateTest/one");
    var _templateList = [
      path.join(projectPath, 'single.html'),
      path.join(projectPath, 'nested.html')
    ];
    var hasTranslations = false;
    var options = {
      minTemplateWS: true
    };

    var finalTemplateList = {
      "single": '<div>hello</div>',
      "nested": '<div> <span> <a href="#"><span>Click Me!</span></a> </span> </div>'
    };

    it('should remove all newlines and tabs from template', function() {
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.deepEqual(finalTemplateList.single, getTemplateStr('single'));
      should.deepEqual(finalTemplateList.nested, getTemplateStr('nested'));
    });

  });


  describe('Testing "allowMultiRootTemplates" option', function() {
    var projectPath = path.join(rootPath, "testdata/templateTest/one");
    var _templateList = [
      path.join(projectPath, 'multiroot.html')
    ];
    var hasTranslations = false;
    var options = {
      allowMultiRootTemplates: true
    };

    var finalTemplateStr = '<div><div>foo</div>\n<div>bar</div></div>';

    it('getTemplate() should not throw an error if the template has more than one root node', function() {
      var templateList, getTemplate, getTemplateStr;

      /*
        will add to scope:
          variables: templateList
          functions: getTemplate(), getTemplateStr()
      */
      eval(templates.process(projectPath, _templateList, hasTranslations, options));

      should.equal(finalTemplateStr, getTemplate('multiroot').html());
    });

  });

});
