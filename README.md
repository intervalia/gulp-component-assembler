[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler.svg)

gulp-component-assembler
========================

Gulp plugin that assembles components including JavaScript, Templates and Localization strings

## Install

    npm install gulp-component-assembler --save-dev

## Usage

```js
var gulp   = require('gulp');
var compasm = require('gulp-component-assembler');

gulp.task('assemble', function() {
  return gulp.src('./lib/*.js')
    .pipe(compasm())
    . put more here
});
```

## Options

## LICENSE

GNU GPL v2.0 <a href="LICENSE">License File</a>
