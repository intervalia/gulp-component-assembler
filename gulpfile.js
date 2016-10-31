var gulp = require('gulp');
var jshint = require('gulp-jshint');
var compasm = require('./src/index');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

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

gulp.task('pre-test', function () {
  return gulp.src(['src/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function () {
  return gulp.src(['test/specs/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports({
      dir: './reports/coverage'
    }));
});

gulp.task("build", function() {
  return gulp.src(['testdata/**/assembly.json'])
  .pipe(compasm.assemble())
  .pipe(gulp.dest('testdata/prod'));
});

gulp.task("default", ["test", "build"]);

gulp.task("buildPluginExample", function() {
  compasm.loadPlugin('all');
  return gulp.src(['sampleAssembly/**/assembly.json'])
  .pipe(compasm.assemble({
    useOldDest: true,
    useExternalLib: true,
    exposeLang: true
  }))
  .pipe(gulp.dest('sampleAssembly/dst/'));
});
