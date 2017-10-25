/*jshint expr: true*/

var fns = require('../../src/externalFunctions').fns;
var path = require('path');
var should = require('should');


describe('\n    Testing the file externalFunctions.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: externalFunctions
   *
   */
  describe("Testing the function '__gca_Str'", function() {

    it('should support nested strings one level deep', function() {
      var template = '<button>{button.something}</button>';
      var final = '<button>Something</button>';

      should.equal(fns.__gca_formatStr(template, {button: {something: 'Something'}}), final);
    });

    it('should support nested strings multiple levels deep', function() {
      var template = '<button>{button.something.somethingElse}</button>';
      var final = '<button>Something Else</button>';

      should.equal(fns.__gca_formatStr(template, {button: {something: {somethingElse: 'Something Else'}}}), final);
    });

    it('should return original text if key does not exist', function() {
      var template = '<button>{button.something.somethingElse}</button>';
      var final = '<button>{button.something.somethingElse}</button>';

      should.equal(fns.__gca_formatStr(template, {button: {anything: {somethingElse: 'Something Else'}}}), final);
    });

    it('should replace all translations even when translations are missing', function() {
      var template = '<button>{button.something.somethingElse}</button><span>{button.anything.somethingElse}</span>';
      var final = '<button>{button.something.somethingElse}</button><span>Something Else</span>';

      should.equal(fns.__gca_formatStr(template, {button: {anything: {somethingElse: 'Something Else'}}}), final);
    });

    it('should replace text with the passed in parameters', function() {
      var template = '{foo: {0}, bar: {1}}';
      var final = '{foo: baz, bar: faz}';

      should.equal(fns.__gca_formatStr(template, 'baz', 'faz'), final);
    });

    it('should replace text with the passed in object', function() {
      var template = '{foo: {faz}, bar: {baz}}';
      var final = '{foo: baz, bar: faz}';

      should.equal(fns.__gca_formatStr(template, {faz:'baz', baz:'faz'}), final);
    });

    it('should not replace keys that are not passed', function() {
      var template = '{foo: {faz}, bar: {baz}}';
      var final = '{foo: baz, bar: {baz}}';

      should.equal(fns.__gca_formatStr(template, {faz:'baz'}), final);
    });

    it('should ignore mixed parameters', function() {
      var template = '{foo: {0}, bar: {baz}}';
      var final = '{foo: baz, bar: {baz}}';

      should.equal(fns.__gca_formatStr(template, 'baz', {baz:'faz'}), final);
    });

    it('should not replace text inside a template binding', function() {
      var template = 'template binding {{scopeVar}} with translation binding {scopeVar}';
      var final = 'template binding {{scopeVar}} with translation binding foo';

      should.equal(fns.__gca_formatStr(template, {scopeVar:'foo'}), final);

      template = 'template binding {{{scopeVar}}} with translation binding {scopeVar}';
      final = 'template binding {{{scopeVar}}} with translation binding foo';

      should.equal(fns.__gca_formatStr(template, {scopeVar:'foo'}), final);
    });

  });

});
