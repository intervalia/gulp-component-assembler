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
  describe("Testing the function '__gca_formatStr'", function() {

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
