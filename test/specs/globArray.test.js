/*jshint expr: true*/

var globArray = require('../../src/globArray');
var path = require('path');
var should = require('should');


describe('\n    Testing the file globArray.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: globArray
   *
   */
  describe("Testing the function 'globArray'", function() {
    it('should get all .js files in \'testdata/main/sub1/**/*.js\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var localePath = path.join(projectPath, "locales");
      var val = globArray("./**/*.js", {cwd: projectPath});
      var temp = [
        'file_sub1.js',
        'file_sub2.js'
      ];

      val.forEach(function(item) {
        temp.should.containEql(path.relative(projectPath, item));
      });
      temp.forEach(function(item) {
        val.should.containEql(path.join(projectPath, item));
      });

      done();
    });

    it('should get all .js files in \'testdata/main/**/*.js\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var localePath = path.join(projectPath, "locales");
      var val = globArray("../**/*.js", {cwd: projectPath});
      var temp = [
        "../file1.js",
        "../file2.js",
        "file_sub1.js",
        "file_sub2.js",
        "../sub2/f1.js"
      ];
      val.forEach(function(item) {
        temp.should.containEql(path.relative(projectPath, item));
      });
      temp.forEach(function(item) {
        val.should.containEql(path.join(projectPath, item));
      });

      done();
    });

    it('should get all .js files in \'testdata/main/**/*.js\' and exclude \'testdata/main/**/sub2/**/*.js\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var localePath = path.join(projectPath, "locales");
      var val = globArray(["../**/*.js", "!../**/sub2/**/*.js"], {cwd: projectPath});
      var temp = [
        "../file1.js",
        "../file2.js",
        "file_sub1.js",
        "file_sub2.js"
      ];
      val.forEach(function(item) {
        temp.should.containEql(path.relative(projectPath, item));
      });
      temp.forEach(function(item) {
        val.should.containEql(path.join(projectPath, item));
      });

      done();
    });

    it('should get all .js files in \'testdata/main/**/*.js\' and exclude \'testdata/main/sub1/**/*.js\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main");
      var localePath = path.join(projectPath, "locales");
      var val = globArray(["**/*.js", "!sub1/**/*.js"], {cwd: projectPath});
      var temp = [
        "file1.js",
        "file2.js",
        "sub2/f1.js"
      ];
      val.forEach(function(item) {
        temp.should.containEql(path.relative(projectPath, item));
      });
      temp.forEach(function(item) {
        val.should.containEql(path.join(projectPath, item));
      });

      done();
    });
  });
});
