/*jshint expr: true*/
var assemblies = require('../../src/assemblies');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var should = require('should');

function readDataFile(path) {
  return fs.readFileSync(path, {"encoding": "utf-8"}).replace(/\r/g, "");
}

describe('\n    Testing the file assemblies.js', function () {
  var rootPath;

  beforeEach(function() {
    rootPath = path.resolve(".");
  });


  /*
   * Test function: assemblies.areTranslationsAvailable
   *
   */
  describe("Testing the function 'areTranslationsAvailable'", function() {
    it('should have translations in \'testdata/main/sub1\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var localePath = path.join(projectPath, "locales");
      var val = assemblies.areTranslationsAvailable(locale, localePath, "strings");
      val.should.be.true;
      done();
    });

    it('should not have translations in \'testdata/main/sub2\'', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub2");
      var localePath = path.join(projectPath, "locales");
      var val = assemblies.areTranslationsAvailable(locale, localePath, "strings");
      val.should.be.false;
      done();
    });

    it('should not crash for fake path', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/notthere");
      var localePath = path.join(projectPath, "locales");
      var val = assemblies.areTranslationsAvailable(locale, localePath, "strings");
      val.should.be.false;
      done();
    });

    it('should not crash for incorrect fileName', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var localePath = path.join(projectPath, "locales");
      var val = assemblies.areTranslationsAvailable(locale, localePath, "incorrect");
      val.should.be.false;
      done();
    });

    it('should throw an error for invalid JSON', function(done) {
      var locale = "en";
      var projectPath = path.join(rootPath, "testdata/main/sub3");
      var localePath = path.join(projectPath, "locales");

      try {
        var val = assemblies.areTranslationsAvailable(locale, localePath, "strings");
        done('No error was thrown for invalid JSON.parse');
      }
      catch (e) {
        // error thrown as we expected
        done();
      }
    });
  });


  /*
   * Test function: assemblies.process
   *
   */
  // describe("testing function 'process'", function() {
  //   /*
  //    * Testing with assembly: testdata/main/sub1/assembly.json
  //    * Which has locales but no templates.
  //    */
  //   describe("process file \'testdata/main/assembly.json\'", function() {
  //     var projectPath;
  //     var assemblyFileName;
  //     var temp;
  //     var assembly;

  //     beforeEach(function() {
  //       projectPath = path.join(rootPath, "testdata/main");
  //       assemblyFileName = path.join(projectPath, "assembly.json");
  //       temp = fs.readFileSync(assemblyFileName, {"encoding": "utf-8"});
  //       assembly = JSON.parse(temp);
  //     });

  //     it('should process with sub assemblies', function(done) {
  //       var options = {
  //         "locale": "en"
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       // fs.writeFileSync("./test/data/main.sub-assemblies.js", val);
  //       temp = readDataFile("./test/data/main.sub-assemblies.js");
  //       val.should.equal(temp);
  //       done();
  //     });
  //   });

  //   /*
  //    * Testing with assembly: testdata/main/sub1/assembly.json
  //    * Which has locales but no templates.
  //    */
  //   describe("process file \'testdata/main/sub1/assembly.json\'", function() {
  //     var projectPath;
  //     var assemblyFileName;
  //     var temp;
  //     var assembly;

  //     beforeEach(function() {
  //       projectPath = path.join(rootPath, "testdata/main/sub1");
  //       assemblyFileName = path.join(projectPath, "assembly.json");
  //       temp = fs.readFileSync(assemblyFileName, {"encoding": "utf-8"});
  //       assembly = JSON.parse(temp);
  //     });

  //     it('should process with default options', function(done) {
  //       var options = {
  //         "locale": "en"
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub1.no-options.js", val);
  //       temp = readDataFile("./test/data/sub1.no-options.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with locale set to \'fr\'', function(done) {
  //       var options = {
  //         "locale": "fr"
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub1.locale-fr.js", val);
  //       temp = readDataFile("./test/data/sub1.locale-fr.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'exposeLang\' set to true', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "exposeLang": true
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub1.exposeLang.js", val);
  //       temp = readDataFile("./test/data/sub1.exposeLang.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'supportTransKeys\' set to true', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "supportTransKeys": true
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub1.supportTransKeys.js", val);
  //       temp = readDataFile("./test/data/sub1.supportTransKeys.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'tagMissingStrings\' set to true', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "tagMissingStrings": true
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub1.tagMissingStrings.js", val);
  //       temp = readDataFile("./test/data/sub1.tagMissingStrings.js");
  //       val.should.equal(temp);
  //       done();
  //     });
  //   });


  //   /*
  //    * Testing with assembly: testdata/main/sub2/assembly.json
  //    * Which has templates but no locales.
  //    */
  //   describe("process file \'testdata/main/sub2/assembly.json\'", function() {
  //     var projectPath;
  //     var assemblyFileName;
  //     var temp;
  //     var assembly;

  //     beforeEach(function() {
  //       projectPath = path.join(rootPath, "testdata/main/sub2");
  //       assemblyFileName = path.join(projectPath, "assembly.json");
  //       temp = readDataFile(assemblyFileName);
  //       assembly = JSON.parse(temp);
  //     });

  //     it('should process with default options', function(done) {
  //       var options = {
  //         "locale": "en"
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub2.no-options.js", val);
  //       temp = readDataFile("./test/data/sub2.no-options.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'minTemplateWS\' set to true', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "minTemplateWS": true
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub2.min-ws.js", val);
  //       temp = readDataFile("./test/data/sub2.min-ws.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'useStrict\' set to true', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "useStrict": true
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub2.useStrict.js", val);
  //       temp = readDataFile("./test/data/sub2.useStrict.js");
  //       val.should.equal(temp);
  //       done();
  //     });

  //     it('should process with option \'iifeParams\' set', function(done) {
  //       var options = {
  //         "locale": "en",
  //         "iifeParams": {
  //           "use": "window, document, $",
  //           "pass": "window, window.document, window.jQuery"
  //         }
  //       };
  //       var val = assemblies.process(assembly, assemblyFileName, options);
  //       //fs.writeFileSync("./test/data/sub2.iifeParams.js", val);
  //       temp = readDataFile("./test/data/sub2.iifeParams.js");
  //       val.should.equal(temp);
  //       done();
  //     });
  //   });
  // });
});
