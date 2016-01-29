var gulp = require('gulp');
var jshint = require('gulp-jshint');
var Mocha = require('mocha');
var compasm = require('./src/index');

gulp.task('lint', function () {
  return gulp.src([
    'src/**/*.js',
    'test/**/*.js',
    'plugins/**/*.js'
  ])
  .pipe(jshint({"esnext": true}))
  .pipe(jshint.reporter('default', { verbose: true }))
  .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function (done) {
  var m = new Mocha();
  m.addFile(__dirname + '/test/specs/index.js');
  m.run().on('end', done);
});

gulp.task("build", function() {
  return gulp.src(['testdata/**/assembly.json'])
  .pipe(compasm.assemble())
  .pipe(gulp.dest('testdata/prod'));
});

gulp.task("default", ["test", "build"]);
