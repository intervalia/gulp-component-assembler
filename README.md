gulp-component-assembler
========================

[![NPM version](http://img.shields.io/npm/v/gulp-component-assembler.svg)](https://npmjs.org/package/gulp-component-assembler)
[![Downloads](http://img.shields.io/npm/dm/gulp-component-assembler.svg)](https://npmjs.org/package/gulp-component-assembler)
[![Support us](http://img.shields.io/gittip/intervalia.svg)](https://www.gittip.com/intervalia/)
[![Build Status](https://travis-ci.org/intervalia/gulp-component-assembler.svg?branch=master)](https://travis-ci.org/intervalia/gulp-component-assembler)
<!--
[![Coveralls Status](https://img.shields.io/coveralls/intervalia/gulp-component-assembler.svg)](https://coveralls.io/r/intervalia/gulp-component-assembler)
-->

---

>Always reference the documents on the git repo since they are updated more often then the NPM package website. I update NPM when there is a code change. I might change documentation without a code change and, at that time, I would not update the version number or NPM release.

---

`gulp-component-assembler` is a gulp plug-in that assembles JavaScript components. The source for the components are a combination of JavaScript files, HTML Templates and Localization strings.

`gulp-component-assembler` uses the file `assembly.json` to define the list of files to assemble into the component output file. The filename of the component will be the name of the folder that contains the `assembly.json` file. The extension of the component file `.js`.

>**Examples:**  
>For a folder named `widget` the component output file will be `widget.js`.  
>For a folder named `MyControl` the component output file will be `MyControl.js`.  
>_The case of the component filename matches the case of the folder name._

### Output file location

Prior to version 2.0.0 the component output file would be placed in a folder of the same name as the output file itself.

As of version 2.0.0 the additional folder name is removed and component output file is placed one folder higher than it had been in previous versions.

>**Example**
>For the path `.../testing/widget/assembly.json` the old, version 1.x, component output file would have been `_outputPath_/widget/widget.js` and the new, version 2.0, component output file will be `_outputPath_/widget.js`

With version 2.x you can continue to use the old output path by including the `useOldDest` option in the `assemble()` command. *See the* `useOldDest` *option below.*

>_The assembled contents of the component file are wrapped inside an **[Immediately-Invoked Function Expression](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression)** (**IIFE**). This helps prevent anything within the component from having a negative effect, like name collisions, with any other script files loaded on the page._

<br/><br/>

---
# Install

`npm install gulp-component-assembler --save-dev`

or

`npm install -g gulp-component-assembler`

---

# Pull Requests and Issues

Please submit **[pull requests](https://github.com/intervalia/gulp-component-assembler/pulls)** and **[issues](https://github.com/intervalia/gulp-component-assembler/issues)**. I want to make this into a tool that is useful to everyone. I will do my best to review and take care of PRs and issues quickly. If you have suggestions, I would love to hear them.

#### PRs for Third-Party Plug-ins

`gulp-component-assembler` supports plug-ins to be run at various times during the assembly process. Plug-ins allow special manipulation of the component output file. If you create a plug-in, please either create a PR on the plug-in page or email me your info. I will add it to the list of third-party plug-ins in the [PLUGINLIST.md file](https://github.com/intervalia/gulp-component-assembler/blob/master/plugins/PLUGINLIST.md)


---

# Usage of `gulp-component-assembler`

The primary usage of the `gulp-component-assembler` is to assemble the component output files. This is done when gulp calls the `assemble()` function. This function uses the information in the `assembly.json` file to assemble the component output file. *The source files does not __need__ to be called `assembly.json`, but it must be a `JSON` file and it must conform to the correct structure of the `assembly.json` file. For simplicity, throughout all documentation, I will call this file `assembly.json`*

You can also call the function `addPlugin()` to add plug-ins into the assembly process. Plug-ins, how to use them and how to write them are defined in the [plug-ins README.md file](https://github.com/intervalia/gulp-component-assembler/tree/master/plugins/README.md)

### Example of the `assemble()` function

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

---
## Options for `assemble()` function

The `assemble()` function takes an optional object which contains any combination of the options defined below. These options allow the user to customize the assembly process and the output file for the component. The options are defined in the object passed to the `assemble()` function. Like this:

```js
compasm.assemble({
  "defaultLocale": "en",
  "exposeLang": true
})
```

#### List of Options

Here is the list of options and their description and usage:

| Key | Example | Use |
|-----|---------|-----|
| **defaultLocale** | `defaultLocale:"en"` | Set the locale that your project will use as the default locale. If you do not provide the `defaultLocale` option then the default locale is set to `"en"`. `defaultLocale` is also the locale that is used if the user attempts to request a non-supported locale. |
| **exposeLang** | `exposeLang:true/false` | If set to `true` then the language strings are also placed into a global object for access outside of the IIFE. The language strings will be added to `[globalObj].[assemblyName].lang` where `assemblyName` is the name of the assembly that is being created.<br/><br/>**See `globalObj`.** |
| **externalLibName** | `externalLibName:"filename"` | Name for the external lib file. The default is `assembly-lib.js` and `assembly-lib-min.js`.<br/><br/>**See `useExternalLib`.** |
| **iifeParams** | `iifeParams:paramsObject` | This is an optional object that contains the list of parameters used by the IIFE and the list of parameters passed into the IIFE. The default values are "window, document".<br/><br/>**See *Option: iifeParams* below.** |
| **globalObj** | `globalObj:"objectToUse"` | This is an optional string that defines the global object that is used to expose the language string into the global scope. The default value is `"window.components"`.<br/><br/>If you are building servers-side components to run in node.js, then you would set this to `"global.components"` or something similar. _But be aware that this could become a problem if you are working with a server cluster._<br/><br/>Currently this is only used if you set the option `exposeLang` to `true`.  |
| **minTemplateWS** | `minTemplateWS:true/false` | This controls how white space is processed in the templates. If set to `true` then each set of white space is reduced to a single space to reduce the overall size of the templates while maintaining separation of tags. If set to `false` then all white space is preserved with the exception the white space at the beginning and end of the template which is trimmed and removed. |
| **supportTransKeys** | `supportTransKeys:true/false` | If set to `true` this creates a set to translation test values.<br/><br/>**See *Option: supportTransKeys* below.** |
| **tagMissingStrings** | `tagMissingStrings:true/false` | If set to `true` then any string that was in the locale file for the default locale that is not found in one of the other locale files is marked so the user can see the lack of translation easily. If set to `false` then the missing translations are set to the key for that string. |
| **useExternalLib** | `useExternalLib:true/false` | If set to `true` then a single file `assambly-lib.js` is created with the common code used for each assembly. If it is set to `false` then each assembly contains copies of the common code needed for the assembly to work. If you choose to use the external libraries then you must include that file before including your own. |
| **useOldDest** | `useOldDest:true/false` | *New in 2.0.0* - If set to `true` then the output directory structure is used (Before ver. 2.0.0) If set to `false` then the output files are stored one level higher that the pre 2.0.0 locations. __This is deprecated and provided for backward compatibility only. `useOldDest` will be removed in version 3.x__ |
| **useStrict** | `useStrict:true/false` | If set to `true` then `"use strict";` is added just inside the IIFE.<br/><br/>**See *Option: useStrict* below.** |
| **watch** | `watch:true/false` | If set to `true` then the dependancies of the assembly file are watched. If any of them change, are added or removed then the `assembly.json` file is `touched` with the current date/time. This allows gulp.watch to monitor only the `assembly.json` files and yet recompile when anything related to the assembly has changed. **It is the developers responsability to use gulp.watch for this to work.** |


_**Option names are case sensitive. `defaultLocale` is correct but `DefaultLocale` is not.**_



### Example using options

Below is an example of assembling a component with the following options set:

* Set the default language to French
* Remove extra white space from templates
* Use the external version of the helper library code
* And, by using `gulp-uglify`, the code will be saved in both a non-minified and minified version file.

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

<br/>
#### Option: `iifeParams`

The option `iifeParams` is used to provide the values that are accessible within the IIFE function and the values that are passed into the IIFE.

*The last parameter in the IIFE function is always `undefined` which is automatically added to the function.*

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


<br/>
#### Option: `supportTransKeys `

When `supportTransKeys` is on the `gulp-component-assembler` auto generates two special locales, `ke` and `zz`. When these locales are used the strings returned in the `lang` object include the key names instead of the translated strings. More information about this is found in the section `Accessing locale strings in your JavaScript` below.


<br/>
#### Option: `useStrict`

If the option `useStrict` is set to `true` then the expression `"use strict";` is added just inside the IIFE function like this:

```js
(function(window, document, undefined) {
  "use strict";

  // Your code here

})(window, window.document);
```

---

# Usage of `assembly.json` file

The `assembly.json` file defines a list of JavaScript source files, HTML template files and sub-assemblies to be included in the component output file. It can also define special locations for locale string files.


### assembly.json file format

The `assembly.json` files supports the following properties: `files`, `templates`, `localePath`, `localFileName`, and `subs`.

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

Note: _Additional properties can be placed in the `assembly.json` file to be used by plug-ins. All additional properties will be ignored by the main `assemble()` function. **But, since we have no idea what features might be added we also don't know what possible properties may be used by the `assemble()` function in the future. For more information please see the section **"Your own properties in the `assembly.json` file"** in the [plug-ins README.md file](https://github.com/intervalia/gulp-component-assembler/tree/master/plugins/README.md)_


---

#### Property: `files`

>The `files` array property is a globby list of JavaScript source files that are to be included in this component. All file names are relative to the location of the `assembly.json` file.

>Each of these files are loaded, in the order provided, and appended into the component file. _No modifications are made to these files._

>All of the code from the files listed in the `files` array is wrapped inside an IIFE. This IIFE is to prevent name collisions between this component and all other JavaScript that you will load. So if you want anything accessible outside of the IIFE then you must provide the code to make it accessible. The simplest, but not best solution, is to create global variable. In the browser this is done by attaching parameters to the `window` object. For example:

```js
var localVar = "This will be a provate varaible, protected inside an IIFE";

window.globalVar = localVar; // This is now accessible throughout the app/web page
```

>_Depending on your environment you may expose properties, classes and functions through things like `module.exports`, `define` or an existing global object or function._


---

#### Property: `templates`

> the `templates` array property is a globby list of template files. `gulp-component-assembler` will load all of these files and convert them into template strings within the assembled component.

>If you do not provide a `temlates` entry in the `assembly.json` then `gulp-component-assembler` will attempt to load the default templates: "./templates/*.html"

>Each file is converted to a string and appended to the `templateList` object in the output component file.

>The templates are loaded by your script by accessing the `templateList` object, or by calling the `loadTemplate()` function or the `loadTemplateStr()` function.

>If there are both templates and locale files then calling `getTemplate()` or `getTemplateStr()` will auto-populate translations in the data returned from those functions.

>Template files allow you to wrap HTML content into your assembly. These templates can be used by your code to create DOM on the fly.

>Angular directives often need templates. Using a provided template system from `gulp-component-assembler` allows the developer to create the templates as stand-alone HTML files and import them into the directives.

>___TODO: Provide more information here___

* Angular example
* jQuery example
* Raw JS example
* Other examples


---

#### Property: `subs`

>One or more `assembly.json` files can be assembled and incorporated as sub-assemblies in the component output file by using the `subs` property to define which assemblies are to be included.

>`subs` is a globby array of `assembly.json` files that are assembled into the component output file. _Again, the name of these `JSON` files does not need to be `assembly.json`, but they must conform with a correctly formatted `assembly.json` file._

>Each assembly will be placed in it's own IIFE function and they each have their own templates and locale files. This also provides a unique name-space for each sub-assembly. But this prevents direct access of values and functions contained in the other sub-assemblies without making them available through the global scope or some other mechanism.

>If the `assembly.json` file in the myComponent folder looked like this:

```js
{
  "subs": [
    "**/assembly.json"
  ]
}
```

>And the file structure looked like this:

```
myComponent
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

Then the component output file `myComponent.js` would include the contents of the sub-assemblies `sub1.js`, `sub2.js`, `thingy/item1.js` and `thingy/item2.js`.

---

##### Property: `localeFileName`

>If the user does not provide a value for `localeFileName` then  `gulp-component-assembler`  attempts to use the value of `'strings'`. If files using that value do not exist then it attempts to use the value of the containing folder.

>One locale file is needed per language. *At this time, `2015-08-03`, we only support the two letter ([ISO-639-1](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)) locale names, like `'en'`, `'fr'`, `'de'`, etc.*

>___TODO: Provide more information here___

>A value of `'localeFile'` would indicate files named like: `localeFile_en.json`, `localeFile_fr.json`, `localeFile_zh.json` etc.

>> **Note:** *If the user sets the `localeFileName` value in the `assembly.json` file then the default value is not used.*


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

#### How to select the locale to be used

To set the selected locale in the browser you would set the global `window.locale` to the locale you want to use.

_The value for `window.locale` must be set before loading any component output file._

>___TODO: Provide more information here___

#### Accessing locale strings in your JavaScript

Within a component output file, each assembly and sub-assembly would contain it's own locale strings. These are accesed through the property `lang`. In the examples JSON files above you would acces the strings as `lang.BUTTON_OK`, `lang.BUTTON_CANCEL`, `lang.BUTTON_CLOSE` and `lang.NO_CHANGES`.

>___TODO: Provide more information here___


#### Accessing locale strings in your templates

Within a template file you access the locale strings by wrapping them within curly braces.

```html
<div>
  <div>{NO_CHANGES}</div>
  <button>{BUTTON_OK}</button>
</div>
```

>___TODO: Provide more information here___

##### Avoiding Conflict with Angular.JS or other systems or frameworks

If you are using a system or framework, like Angular.js, that uses double curly-braces then you need to be careful in how you name your locale strings and your Angular scope variables, etc. I recommend that, for example, you use all caps for locale strings and intra-caps for your angular variables. Like this:

```html
<div>
  <div>
  	<label>{NAME}</label>
  	<input ng-model="person.firstName" type="text">
  </div>
  <div>{YOUR_NAME} {{person.firstName}}</div>
</div>
```

In the example above, `NAME` and `YOUR_NAME` would be locale strings and not related to Angular. `person.firstName` would be an Angular variable and would not be handled as a locale string.

>___TODO: Provide more information here___


---
# Plug-ins

`gulp-component-assembler` support plug-ins. I have provided several and you can write their own.

For a list of available plug-ins go to the [PLUGINLIST.md file](./plugins/PLUGINLIST.md).

For information on how to create your own plug-ins go to the [plug-ins README.md file](./plugins/README.md).


---
# License

MIT - [License File](LICENSE.md)


---

# Update History

[Update History File](UPDATE_HISTORY.md)
