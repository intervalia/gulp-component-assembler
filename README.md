[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler.svg)

gulp-component-assembler
========================
#### Always reference the documents on the git repo since they are updated more often then the NPM package website. I only update NPM when there is a code change but I may add to the documentation without a code change and, at that time, I will not update NPM.  
---

`gulp-component-assembler` is a gulp plug-in that assembles JavaScript components. The components are a combination of JavaScript files, HTML Templates and Localization strings.

`gulp-component-assembler` uses the file `assembly.json` to define the list of files to assemble into the component output file. The filename of the component will be the name of the folder that contains the `assembly.json` file. The extension of the component file `.js`. If the folder name was `widget` then the component file will be called `widget.js`. A folder named `MyControl` would produce an output file named `MyControl.js`. _The case of the component filename matches the case of the folder name._

_The assembled contents of the component file are wrapped inside an **[Immediately-Invoked Function Expression](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression)** (**IIFE**). This helps to prevent anything within the component from having a name collision with other code on the page._
se either create a PR on the plug-in page or email me your info.



## Install
```shell
npm install gulp-component-assembler --save-dev
or
npm install -g gulp-component-assembler
```



## Pull Requests and Issues
Please submit **[pull requests](https://github.com/intervalia/gulp-component-assembler/pulls)** and **[issues](https://github.com/intervalia/gulp-component-assembler/issues)**. I want to make this into a tool that is useful to everyone. I will do my best to review and take care of PRs and issues quickly. If you have suggestions, I would love to hear them.

Almost anything can be done in a plug-ins for `gulp-component-assembler`. If you create a plug-in, plea


## Usage of `gulp-component-assembler`
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

_**Option names are case sensitive. `defaultLocale` is correct but `DefaultLocale` is not.**_


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
The `assembly.json` files supports the following peroperties: `files`, `templates`, `localePath`, `localFileName`, and `subs`.

The minimum `assembly.json` file must contain the `files` array, which defines the JavaScript source files to include in the assembled component.

```js
{
  "files": [
    "file1.js",
    "src/file2.js"
  ]
}
```

The built-in properties of the assembly.json file:

| Property | Type | Description |
| --- | --- | --- |
| `files` | globby array of files | The list of one or more files, normally JavaScript files, to combine into the component file. |
| `templates` | globby array of files | The list of one or more files, normally HTML files, to combine as template strings into the component file. |
| `subs` | globby array of files | A list of one or more `assembly.json` files that are assembled into the component output file. |
| `localeFileName` | string | The root of the locale file names. The default is `strings` or the name of the containing folder. |
| `localePath` | string | A relative path indicating where to load the locale files. The default path is `./locales`. |


---
#### Property: `files`
>The `files` array is a list of JavaScript source files that are to be included in this component. All file names are relative to the location of the assembly.json file.

>Each of these files are loaded, in the order provided, and written into the component file. No modifications are made to these files.

>_Your `assembly.json` file must include the `files` property. It is required. Though, if you include the `subs` property the `files` property is no longer required and can be excluded._

>All of the code from the files listed in the `files` array is wrapped inside an IIFE. This IIFE is to prevent name collisions between this component and all other JavaScript that you will load. So if you want anything accessible outside of the IIFE then you must provide the code to make it accessible. The simplest, but not best solution, is to create global variable. In the browser this is done by attaching parameters to the `window` object. For example:

```js
var localVar = "This will be a provate varaible, protected inside an IIFE";

window.globalVar = localVar; // This is now accessible throughout the app/web page
```

>_Depending on your environment you may expose properties, classes and functions through things like `module.exports`, `define` or an existing global object or function._


---
#### Property: `templates`
>`gulp-component-assembler` will load all of the files specified in the `templates` array and convert them into template string within the assembled component.

>If you do not provide a `temlates` entry in the `assembly.json` then the default is "templates/*.html"

>Each file is appended to the `templateList` object in the output component file.

>___TODO: Provide more information here___


---
#### Property: `subs`
>One or more `assembly.json` files can be assembled and incorporated as sub-assemblies in the component output file by using the `subs` property to define which assemblies are to be included.

>`subs` is a globby array of JSON files that are assembled into the component output file.

>Each assembly will be placed in it's own IIFE function and they each have their own templates and locale files. This also provides a unique name-space for each sub-assembly. But this prevents direct access of values and functions contained in the other sub-assemblies without making them available through the global scope or some other mechanism.

```js
{
  "subs": [
    "**/assembly.json"
  ]
}
```

>This assembly would work on a file structure like this:

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


---
##### Property: `localeFileName`

>If the user does not provide a value for `localeFileName` then  `gulp-component-assembler`  attempts to use the value of `strings`. If files using that value do not exist then it attempts to use the value of the containing folder.

>One locale file is needed per language. At this time, `2014-12-19`, we only support the two letter ([ISO-639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)) locale names, like `'en'`, `'fr'`, `'de'`, etc.

>___TODO: Provide more information here___ 

>A value of `strings` would indicate files named like: `strings_en.json`, `strings_fr.json`, `strings_zh.json` etc.

>* *If the user sets the `localeFileName` value in the `assembly.json` file then the default values are not used.*


<!--
##### locale files with comments

>___TODO: Provide more information here___
-->


---
### Locale File format
>Locale files are JSON files. They contain a single object that uses keys and values.

>The default

>* strings_en.json:

```js
{
  "BUTTON_OK": "OK",
  "BUTTON_CANCEL": "Cancel",
  "BUTTON_CLOSE": "Close",
  "NO_CHANGES": "No Recent Changes"
}
```

>* strings_fr.json:

```js
{
  "BUTTON_OK": "OK",
  "BUTTON_CANCEL": "Annuler",
  "BUTTON_CLOSE": "Fermer",
  "NO_CHANGES": "Aucunes modifications récentes"
}
```

>* strings_es.json:

```js
{
  "BUTTON_OK": "OK",
  "BUTTON_CANCEL": "Cancelar",
  "BUTTON_CLOSE": "Cerrar",
  "NO_CHANGES": "No hay cambios recientes"
}
```

## Plug-ins

`gulp-component-assembler` support third-party plug-ins.

For a list of available plug-ins go to the [PLUGINLIST.md file](https://github.com/intervalia/gulp-component-assembler/tree/master/plugins/PLUGINLIST.MD).

For information on how to create your own plug-ins go to the [plug-ins README.md file](https://github.com/intervalia/gulp-component-assembler/tree/master/plugins/README.md).



## LICENSE

MIT - <a href="LICENSE.md">License File</a>


# UPDATE HISTORY

###1.0.5
* Changed license to MIT
* Updated main README.md
* Added README.md in the plugins folder to describe plug-ins, how to write them, and what plug-ins are currently available.  

###1.0.4
* Updated main README.md
* Added assemble option `useStrict`.
* Changed `iifeParams` from a string to an object with `use` and `pass` parameters.
* Added globby paths for the `files` and `templates` properties.
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
