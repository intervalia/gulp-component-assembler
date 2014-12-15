[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler.svg)

gulp-component-assembler
========================

Gulp plugin that creates assembled components consisting JavaScript, HTML Templates and
Localization strings.

## Install

    npm install gulp-component-assembler --save-dev
    or
    npm install -g gulp-component-assembler


## Usage

```js
var gulp   = require('gulp');
var compasm = require('gulp-component-assembler');

gulp.task('assemble', function() {
  return gulp.src('./**/assembly.json')
    .pipe(compasm.assemble()
    .pipe(gulp.dest('./dist'))
});
```

## Options

The `assemble()` function can take any combination of the following options. These options provide the user a way to customize the output of the components. The options are added through an object passed in to the `assemble()` function. Like this:

```js
compasm.assemble({
  "defaultLocale": "en",
  "exposeLang"
})
```

Here is the list of options and their description and useage:

| key | Example | Use |
| --- | ------- | --- |
| **defaultLocale** | `defaultLocale:"en"` | Set the locale that your project will use as the default. This is also the locale that will get used if the user attempts to specify a non-supported locale. |
| **minTemplateWS** | `minTemplateWS:true/false` | If set to `true` then each set of whitespace is reduced to a single space to reduce the overall size of the templates while maintaining separaton of tags. If set to `false` then all whitespace is preserved. (Except the whitespace at the beginning and end of the template which is removed.) |
| **useExternalLib** | `useExternalLib:true/false` | If set to `true` then a single file `assambly-lib.js` is created with the common code used for each assembly. If it is set to `false` then each assembly contains copies of the common code needed for the assembly to work. If you choose to use the external libraries then you must include that file before including your own. |
| **externalLibName** | `externalLibName:"filename"` | Name for the external lib file. The default is `assembly-lib.js` and `assembly-lib-min.js` |
| **iifeParams** | `iifeParams:"params"` | This is a list of parameters that are both used by the iife and passed into the iife. The default values are "window, document". This option allows the user to pass other parameters into the iffe.
| **supportTransKeys** | `supportTransKeys:true/false` | If set to `true` this creates a set ot translation test values. **More needed here** |
| **tagMissingStrings** | `tagMissingStrings:true/false` | If set to `true` then any string that was in the locale file for the default locale that is not found in one of the other locale files is marked so the user can see the lack of translation easily. If set to `false` then the translations are set to the key for that string. |
| **exposeLang** | `exposeLang:true/false` | If set to `true` then the local strings are placed into a global object for access outside of the iife. The language strings will be added to `window.sommus.[assemblyName].lang` where `assemblyName` is the name of the assembly that is being created. |

Below is an example of assembling a component with the following options set:
* Default language set to French
* Remove extra white-space from templates
* Use the external version of the helper code
And the code will be save in non-minified and minified versions

```js
var gulp   = require('gulp');
var compasm = require('gulp-component-assembler');

gulp.task('assemble', function() {
  return gulp.src('./**/assembly.json')
    .pipe(compasm.assemble({
          "defaultLocale": 'fr',
          "minTemplateWS": true,
          "useExternalLib": true
        })
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename(function (path) {path.basename += "-min";}))
    .pipe(gulp.dest('./dist'))
});
```

## Usage

### assembly.json file format

The `assembly.json` file defines what source files are to be included in the assembled component. It can also define special locations for locale string files, special locations of the template files and which, if any, sub-assemblies are to be included in this component.

The minimum `assembly.json` file must contain the `files` array, which defines the JavaScript source files to include in the assembled component.

```js
{
  "files": [
    "**/*.js"
  ]
}
```

* **note:** As of 2014/12/15 I still do not have glob working on files listed in the files array*

#### files

*Coming soon*

#### templates

*Coming soon*

##### templates folder

*Coming soon*

##### templates paramater in assembly.json

*Coming soon*

#### locale files

*Coming soon*

string_en.json
string_fr.json

##### locale files with comments

*Coming soon*

### Sub-assemblies

## Plugins

`gulp-component-assembler` support plugin in three different locations of the process: `PRE`, `INLINE` and `POST`.

| Plugin Type | Description |
| ----------- | ----------- |
| `PRE` | Pre-plugins are processed just before the iife of the assembly. This makes anything create by the pre-plugin to become global. But nothing from any of the iifes has run at the time the pre-plugin code executes. |
| `INLINE` | Inline plugins are processed within the iifes of all assemblies after all of the other code, language string and templates of those assemblies are processed. |
| `POST` | Post-plugins are processed just after *all* of the iifes from *all* of the assemblies are processed. This makes anything create by the post-plugin to become global and it can access anything made global by code within any of the the iife. |

## LICENSE

GNU GPL v2.0 <a href="LICENSE">License File</a>
