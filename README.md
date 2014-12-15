[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler.svg)

gulp-component-assembler
========================

`gulp-component-assembler` is a gulp plugin that creates assembled components
consisting JavaScript, HTML Templates and Localization strings.

`gulp-component-assembler` uses the file assembly.json to define the list of
files to assemble into the output component file. The component filename will
be the name of the folder that contains the assembly.json file. The extension
of the component file `.js`. If the folder name was `widget` then the component
file will be called `widget.js`. A folder named `MyControl` would produce
an output file named `MyControl.js`. The case of the component filename matches
the case of the folder name.

_The assembled contents of the component file are wrapped inside an
Immediately-Invoked Function Expression (**IIFE**). This helps to prevent anything
within the component from having a name collision with other code on the page._

## Install
```shell
npm install gulp-component-assembler --save-dev
or
npm install -g gulp-component-assembler
```



## Simple Usage
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
The `assemble()` function can take any combination of the following options.
These options provide the user a way to customize the output of the components.
The options are added through an object passed in to the `assemble()` function.
Like this:

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
| **iifeParams** | `iifeParams:"params"` | This is a list of parameters that are both used by the IIFE and passed into the IIFE. The default values are "window, document". This option allows the user to pass other parameters into the iffe.
| **supportTransKeys** | `supportTransKeys:true/false` | If set to `true` this creates a set ot translation test values. **More needed here** |
| **tagMissingStrings** | `tagMissingStrings:true/false` | If set to `true` then any string that was in the locale file for the default locale that is not found in one of the other locale files is marked so the user can see the lack of translation easily. If set to `false` then the translations are set to the key for that string. |
| **exposeLang** | `exposeLang:true/false` | If set to `true` then the local strings are placed into a global object for access outside of the IIFE. The language strings will be added to `window.sommus.[assemblyName].lang` where `assemblyName` is the name of the assembly that is being created. |

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


## Detailed Usage


### assembly.json file format
The `assembly.json` file defines what source files are to be included in the
assembled component. It can also define special locations for locale string
files, special locations of the template files and which, if any, sub-assemblies
are to be included in this component.

The minimum `assembly.json` file must contain the `files` array, which defines
the JavaScript source files to include in the assembled component.

```js
{
  "files": [
    "file1.js",
    "src/file2.js"
  ]
}
```

There are four properties of the assembly.json file:

* `files` (globby array of files): The list of one or more files, normally JavaScript files, to combine into the component file.
* `templates` (globby array of files): The list of one or more files, normally HTML files, to combine as template strings into the component file. The default globby path is `templates/*.html`.
* `localePath` (string): A relative path indicating where to load the locale files. The default path is `./locales`.
* `assemblies` (globby array of folders): A list of one or more folders which contain an `assembly.json` file that is assembled into the component file. (Each new assembly is added in their own IIFE.)


#### files
The `files` array is a list of JavaScript source files that are to be included
in this compnent. All file names are relative to the location of the
assembly.json file.

Each of these files are loaded, in the order provided, and written into the
component file. No modifications are made to these files.

_Your `assembly.json` file must include the `files` property. It is required.
Though, if you include the `assemblies` property the `files` property is no
longer required and can be excluded._

All of the code from the files listed in the `files` array is wrapped inside
an IIFE. This IIFE is to prevent name collisions between this component and
all other JavaScript that you will load. So if you want anything accessible
outside of the IIFE then you must provide the code to make it accessible. The
simplest, but not best solution, is to create global variable. In the browser
this is done by attaching parameters to the `window` object. For example:

```js
var localVar = "This will be a provate varaible, protected inside an IIFE";

window.globalVar = localVar; // This is now accessible throughout the app/web page
```

_Depending on your environment you may expose properties, classes and functions
through things like `module.exports`, `define` or an existing global object or function._



#### templates

*Coming soon*



##### templates folder

The default template folder is `./templates`. gulp-component-assembler will load
all of the files in that folder that end with `.html` and convert them into
template string within the assembled component.



##### templates paramater in assembly.json

*Coming soon*



#### locale files

*Coming soon*

string_en.json
string_fr.json



##### locale files with comments

*Coming soon*



### Sub-assemblies
One or more sub-assemblies can be incorporated into the output component file
by using the `assemblies` property to define which sub-assemblies are to be used.

`assemblies` is an array of folders which contain an `assembly.json` file that
is assembled into the component file. Each sub-assembly will be placed in it's
own IIFE scope so they can each have their own templates and locale files.
This also provides a unique namespace for each sub-assembly. But this prevents
direct access of values and functions contained in the other sub-assemblies without
making them available through the global scope or some other mechanism.

```
{
  "assemblies": [
    "sub1",
    "sub2",
    "thingy/item1",
    "thingy/item2"
  ]
}
```

This assembly would work on a file structure like this:
```
componentFolder
│
├── assembly.json
├── sub1
│   │
│   ├── assembly.json
│   └── file.js
│
├── sub2
│   │
│   ├── assembly.json
│   └── file.js
│
└── thingy
    │
    ├── item1
    │   │
    │   ├── assembly.json
    │   └── file.js
    │
    └── item2
        │
        ├── assembly.json
        └── file.js
```



## Plugins

`gulp-component-assembler` support plugin in three different locations of the
process: `PRE`, `INLINE` and `POST`.

| Plugin Type | Description |
| ----------- | ----------- |
| `PRE` | Pre-plugins are processed just before the iife of the assembly. This makes anything create by the pre-plugin to become global. But nothing from any of the iifes has run at the time the pre-plugin code executes. |
| `INLINE` | Inline plugins are processed within the iifes of all assemblies after all of the other code, language string and templates of those assemblies are processed. |
| `POST` | Post-plugins are processed just after *all* of the iifes from *all* of the assemblies are processed. This makes anything create by the post-plugin to become global and it can access anything made global by code within any of the the iife. |



## LICENSE

GNU GPL v2.0 <a href="LICENSE">License File</a>
