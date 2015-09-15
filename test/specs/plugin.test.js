/*jshint expr: true*/
var plugin = require('../../src/plugin');
var assemblies = require('../../src/assemblies');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var should = require('should');

function readDataFile(path) {
  return fs.readFileSync(path, {"encoding": "utf-8"}).replace(/\r/g, "");
}

describe('\n    Testing the file plugin.js', function () {
  var rootPath;

  beforeEach(function() {
    rootPath = path.resolve(".");
  });


  /*
   * Test object: TYPE
   *
   */
  describe("Testing the object 'TYPE'", function() {
    it('should have all the valid properties', function(done) {
      var temp = {
        "INLINE_PRE": "INLINE_PRE",
        "INLINE_POST": "INLINE_POST",
        "PRE": "PRE",
        "POST": "POST",
        "FILE_PRE": "FILE_PRE",
        "FILE_POST": "FILE_POST"
      };
      var types = plugin.TYPE;
      var item, cmp;

      for(item in types) {
        cmp = {};
        cmp[item] = types[item];
        temp.should.containEql(cmp);
      }
      for(item in temp) {
        cmp = {};
        cmp[item] = temp[item];
        types.should.containEql(cmp);
      }
      done();
    });
  });

  describe("Testing the function 'addPlugin'", function() {
    afterEach(function() {
      plugin.clear();
    });

    it('should process inlinePre correctly', function(done) {
      var val = 0;
      function cb() {
        val++;
      }
      val.should.equal(0);
      plugin.addPlugin(plugin.TYPE.INLINE_PRE, cb);
      plugin.addPlugin(plugin.TYPE.INLINE_PRE, cb);
      val.should.equal(0);
      plugin.processInlinePre();
      val.should.equal(2);
      done();
    });

    it('should process inlinePost correctly', function(done) {
      var val = 0;
      function cb() {
        val++;
      }
      val.should.equal(0);
      plugin.addPlugin(plugin.TYPE.INLINE_POST, cb);
      val.should.equal(0);
      plugin.processInlinePost();
      val.should.equal(1);
      done();
    });

    it('should process FilePre correctly', function(done) {
      var val = 0;
      var params = "testing";
      var params2;
      function cb(p) {
        val++;
        params2 = p;
      }
      val.should.equal(0);
      plugin.addPlugin(plugin.TYPE.FILE_PRE, cb);
      val.should.equal(0);
      plugin.processFilePre();
      val.should.equal(1);
      done();
    });

    it('should process FilePost correctly', function(done) {
      var params = {
        "one": 1,
        "name": "testing",
        "passed": true
      };
      var params2, item, cmp;
      function cb(p) {
        params2 = p;
      }

      plugin.addPlugin(plugin.TYPE.FILE_POST, cb);
      plugin.processFilePost(params);

      for(item in params) {
        cmp = {};
        cmp[item] = params[item];
        params2.should.containEql(cmp);
      }
      for(item in params2) {
        cmp = {};
        cmp[item] = params2[item];
        params.should.containEql(cmp);
      }
      done();
    });

    it('should process Pre correctly', function(done) {
      var val = 0;
      var params = "testing";
      var params2;
      function cb(p) {
        val++;
        params2 = p;
      }
      val.should.equal(0);
      plugin.addPlugin(plugin.TYPE.PRE, cb);
      val.should.equal(0);
      plugin.processPre();
      val.should.equal(1);
      done();
    });

    it('should process Post correctly', function(done) {
      var params = {
        "one": 1,
        "name": "testing",
        "passed": true
      };
      var params2, item, cmp;
      function cb(p) {
        params2 = p;
      }

      plugin.addPlugin(plugin.TYPE.POST, cb);
      plugin.processPost(params);

      for(item in params) {
        cmp = {};
        cmp[item] = params[item];
        params2.should.containEql(cmp);
      }
      for(item in params2) {
        cmp = {};
        cmp[item] = params2[item];
        params.should.containEql(cmp);
      }
      done();
    });

    it('should process all plug-ins in the correct place', function(done) {
      function inlinePreCB(p) {
        return "// --==**==-- inlinePre ("+p.assemblyFileName+")\n";
      }
      function inlinePostCB(p) {
        return "// --==**==-- inlinePost ("+p.assemblyFileName+")\n";
      }
      function filePreCB(p) {
        return "// --==**==-- filePre ("+p.fileName+")\n";
      }
      function filePostCB(p) {
        return "// --==**==-- filePost ("+p.fileName+")\n";
      }
      function preCB(p) {
        return "// --==**==-- pre ("+p.assemblyFileName+")\n";
      }
      function postCB(p) {
        return "// --==**==-- post ("+p.assemblyFileName+")\n";
      }

      plugin.addPlugin(plugin.TYPE.INLINE_PRE, inlinePreCB);
      plugin.addPlugin(plugin.TYPE.INLINE_POST, inlinePostCB);
      plugin.addPlugin(plugin.TYPE.FILE_PRE, filePreCB);
      plugin.addPlugin(plugin.TYPE.FILE_POST, filePostCB);
      plugin.addPlugin(plugin.TYPE.PRE, preCB);
      plugin.addPlugin(plugin.TYPE.POST, postCB);

      var projectPath = path.join(rootPath, "testdata/main/sub1");
      var assemblyFileName = path.join(projectPath, "assembly.json");
      var temp = fs.readFileSync(assemblyFileName, {"encoding": "utf-8"});
      var assembly = JSON.parse(temp);

      var options = {
        "locale": "en"
      };
      var val = assemblies.process(assembly, assemblyFileName, options);
      //fs.writeFileSync("./test/data/sub1.with-plugins.js", val);
      temp = readDataFile("./test/data/sub1.with-plugins.js");
      val.should.equal(temp);

      done();
    });

  });
});
