[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler.svg)

gulp-component-assembler
========================

`gulp-component-assembler` is a gulp plugin that assembles JavaScript components. The components are a combination of JavaScript files, HTML Templates and Localization strings.

`gulp-component-assembler` uses the file `assembly.json` to define the list of files to assemble into the component output file. The filename of the component will be the name of the folder that contains the `assembly.json` file. The extension of the component file `.js`. If the folder name was `widget` then the component file will be called `widget.js`. A folder named `MyControl` would produce an output file named `MyControl.js`. _The case of the component filename matches the case of the folder name._

_The assembled contents of the component file are wrapped inside an **[Immediately-Invoked Function Expression](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression)** (**IIFE**). This helps to prevent anything within the component from having a name collision with other code on the page._

## Install
```shell
npm install gulp-component-assembler --save-dev
or
npm install -g gulp-component-assembler
```



## Usage of gulp-component-assembler
The primary function of the component assembler is `assemble()`. This function will use the information in the `assembly.json` file assemble the component output file.

Here is an example of how to use the `assemble()` function:
```js
var gulp = require('gulp');
var compasm = require('gulp-component-assembler');

gulp.task('assemble', function() {
  return gulp.src('./assembly.json')
    .pipe(compasm.assemble())
    .pipe(gulp.dest('./dist'))
});
```


## Options for `assemble()` function
The `assemble()` function can take an object which contains any combination of the options defined below. These options allow the user to customize the assembly process and the output of the components. The options are defined in the object passed to the `assemble()` function. Like this:

```js
compasm.assemble({
  "defaultLocale": "en",
  "exposeLang"
})
```

Here is the list of options and their description and usage:

| Key | Example | Use |
| --- | ------- | --- |
| **defaultLocale** | `defaultLocale:"en"` | Set the locale that your project will use as the default locale. If you do not provide the `defaultLocale` option then the default locale is `"en"`. This is also the locale that is used if the user attempts to request a non-supported locale. |
| **exposeLang** | `exposeLang:true/false` | If set to `true` then the language strings are also placed into a global object for access outside of the IIFE. The language strings will be added to `window.sommus.[assemblyName].lang` where `assemblyName` is the name of the assembly that is being created. |
| **externalLibName** | `externalLibName:"filename"` | Name for the external lib file. The default is `assembly-lib.js` and `assembly-lib-min.js`.<br/><br/>**See `useExternalLib`.** |
| **iifeParams** | `iifeParams:"params"` | This is an optional object that a set of parameters used by the IIFE and the list of parameters passed into the IIFE. The default values are "window, document".<br/><br/>**See *Option: iifeParamn* below.**
| **minTemplateWS** | `minTemplateWS:true/false` | If set to `true` then each set of whitespace is reduced to a single space to reduce the overall size of the templates while maintaining separaton of tags. If set to `false` then all whitespace is preserved. (Except the whitespace at the beginning and end of the template which is removed.) |
| **supportTransKeys** | `supportTransKeys:true/false` | If set to `true` this creates a set ot translation test values.<br/><br/>**TODO: Provide more information here** |
| **tagMissingStrings** | `tagMissingStrings:true/false` | If set to `true` then any string that was in the locale file for the default locale that is not found in one of the other locale files is marked so the user can see the lack of translation easily. If set to `false` then the translations are set to the key for that string. |
| **useExternalLib** | `useExternalLib:true/false` | If set to `true` then a single file `assambly-lib.js` is created with the common code used for each assembly. If it is set to `false` then each assembly contains copies of the common code needed for the assembly to work. If you choose to use the external libraries then you must include that file before including your own. |
| **useStrict** | `useStrict:true/false` | If set to `true` then `"use strict";` is added just inside the IIFE.<br/><br/>**See *Option: useStrict* below.** |

** *Option names are case sensitive. `defaultLocale` is correct but `DefaultLocale` is not.* **


### Example using options
Below is an example of assembling a component with the following options set:
* Default language set to French
* Remove extra white-space from templates
* Use the external version of the helper code
And, by using `gulp-uglify`, the code will be saved in both a non-minified and minified version file.

```js
var gulp   = require('gulp');
var uglify  = require('gulp-uglify');
var rename  = require('gulp-rename');
var compasm = require('gulp-component-assembler');

gulp.task('assemble', function() {
  return gulp.src('./assembly.json')
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


#### Option: `iifeParams`

The option `iifeParams` is used to provide the values that are accessible within the IIFE function and the values that are passed into the IIFE.

*The last parameter in the IIFE function is `undefined` which is automatically added to the function.*

To set these values you create an object that has both a `use` and a `pass` property like this:

```js
"iifeParams": {
  "use": "window, document, $",
  "pass": "window, window.document, window.jQuery"
}
``` 

This will produce the following in the component output file:
```js
(function(window, document, $, undefined) {

  // Your code would be here.
 
})(window, window.documet, window.jQuery);
```


#### Option: `useStrict`
If the option useStrict` is set to `true` then the expression `"use strict"` is added just inside the IIFE function like this:

```js
(function(window, document, undefined) {
  "use strict";

  // Your code here

})(window, window.document);
```

## Usage of assembly.json file
The `assembly.json` file defines a list of JavaScript source files, HTML template files and sub-assemblies to be included in the component output file. It can also define special locations for locale string files.



### assembly.json file format
The `assembly.json` files supports the following peroperties: `files`, `templates`, `localePath`, `localFileName`, and `assemblies`.

The minimum `assembly.json` file must contain the `files` array, which defines the JavaScript source files to include in the assembled component.

```js
{
  "files": [
    "file1.js",
    "src/file2.js"
  ]
}
```

The five properties of the assembly.json file:

| Property | Type | Description |
| --- | --- | --- |
| `files` | globby array of files | The list of one or more files, normally JavaScript files, to combine into the component file. |
| `templates` | globby array of files | The list of one or more files, normally HTML files, to combine as template strings into the component file. |
| `assemblies` | globby array of files | A list of one or more `assembly.json` files that are assembled into the component output file. |
| `localeFileName` | string | The root of the locale file names. The default is `strings` or the name of the containing folder. |
| `localePath` | string | A relative path indicating where to load the locale files. The default path is `./locales`. |


#### Property: `files`
The `files` array is a list of JavaScript source files that are to be included in this component. All file names are relative to the location of the assembly.json file.

Each of these files are loaded, in the order provided, and written into the component file. No modifications are made to these files.

_Your `assembly.json` file must include the `files` property. It is required. Though, if you include the `assemblies` property the `files` property is no longer required and can be excluded._

All of the code from the files listed in the `files` array is wrapped inside an IIFE. This IIFE is to prevent name collisions between this component and all other JavaScript that you will load. So if you want anything accessible outside of the IIFE then you must provide the code to make it accessible. The simplest, but not best solution, is to create global variable. In the browser this is done by attaching parameters to the `window` object. For example:

```js
var localVar = "This will be a provate varaible, protected inside an IIFE";

window.globalVar = localVar; // This is now accessible throughout the app/web page
```

_Depending on your environment you may expose properties, classes and functions through things like `module.exports`, `define` or an existing global object or function._



#### Property: `templates`

`gulp-component-assembler` will load all of the files specified in the `templates` array and convert them into template string within the assembled component.

If you do not provide a `temlates` entry in the `assembly.json` then the default is "templates/*.html"

Each file is appended to the `templateList` object in the output component file.

___TODO: Provide more information here___


#### Property: `assemblies`
One or more assemblies can be incorporated as sub-assemblies in the component output file by using the `assemblies` property to define which assemblies are to be included.

`assemblies` is an array of `assembly.json` files that are assembled into the component output file. Each assembly will be placed in it's own IIFE function and they each have their own templates and locale files. This also provides a unique namespace for each sub-assembly. But this prevents direct access of values and functions contained in the other sub-assemblies without making them available through the global scope or some other mechanism.

```
{
  "assemblies": [
    "sub1/assembly.json",
    "sub2/assembly.json",
    "thingy/item1/assembly.json",
    "thingy/item2/assembly.json"
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



##### Property: `localeFileName`

If the user does not provide a value for `localeFileName` then  `gulp-component-assembler`  attempts to use the value of `strings`. If files using that value do not exist then it attempts to use the value of the containing folder. ___TODO: Provide more information here___ 

If the user sets the `localeFileName` value in the `assembly.json` file then the default values are not used.

A value of `strings` would indicate files named like: `strings_en.json`, `strings_fr.json`, `strings_zh.json` etc.


<!--
##### locale files with comments

___TODO: Provide more information here___
-->


### Locale File format
Locale files are JSON files. They


## Plugins

`gulp-component-assembler` support plugin in three different locations of the process: `PRE`, `INLINE` and `POST`.

___TODO: Provide more information here___

| Plugin Type | Description |
| ----------- | ----------- |
| `PRE` | Pre-plugins are processed just before the iife of the assembly. This makes anything create by the pre-plugin to become global. But nothing from any of the iifes has run at the time the pre-plugin code executes. |
| `INLINE` | Inline plugins are processed within the iifes of all assemblies after all of the other code, language string and templates of those assemblies are processed. |
| `POST` | Post-plugins are processed just after *all* of the iifes from *all* of the assemblies are processed. This makes anything create by the post-plugin to become global and it can access anything made global by code within any of the the iife. |



## LICENSE

GNU GPL v2.0 <a href="LICENSE">License File</a>


# UPDATE HISTORY

* 1.0.4 - Added blobby paths for the `files` and `templates` properties. You can now set
```js
{
  "files": [
    "**/*.js"
  ],
  "templates": [
    "**/*.html"
  ]
}
```
