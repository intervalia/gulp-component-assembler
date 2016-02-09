Update History
==============
### 3.0.0 - Feb 8, 2016
* Improved Unit tests to test functionality instead of comparing the output to a fixed, expected, string.
* Warn when a file in the `files` array is missing. - **POSSIBLE BREAKING from 2.x**
* Improved the locale detection code to select the first locale that matches the available translations. - **POSSIBLE BREAKING from 2.x**
* Change unit tests to not use string compare
* Make assembly output easier to read when not minified
* Fix getLang to correctly process an array of locales
* Fix plugins to allow undefined or null as a return value
* Require templates to be single root node (unless `allowMultiRootTemplates` option is set to true) - **BREAKING from 2.x**
* add tests for scripts and templates
* output error message when included file is not found
* output log when trying to access a template that doesn't exist using getTemplate or getTemplateStr
* change plugins to use new types - **BREAKING from 2.x**
* allow plugins to self-register their plugin type - **BREAKING from 2.x**
* update predefined plugins to self-register them
* fix errors not being reported by gulp stream
* create tests for plugin, oldTemplates, and oldSubAssemblies
* Cleaning up the external library code. - **POSSIBLE BREAKING from 2.x**
* Added a format function that was missing from previous versions. No longer rely on String.prototype.format which did not exist for most people. - **POSSIBLE BREAKING from 2.x**
* Adding a sample project that uses the new all plugin to demonstrate where plug-ins are placed.
* Correctly positioned the BEFORE and AFTER plug-ins to only happen once for an entire assembly and in the correct place.
* Plug-in functions now get passed in the TYPE of plugin they are so you can create a single function to handle multiple insertion points.
* Updated some docs for changes and accuracy.

### 2.1.1 - Jan 4, 2016
* Added option to define the variable that holds the locale to use. The default is still `window.locale` but you can now define it by setting the option `localeVar`.
* Added tests to validate the locale code is working correctly
* Spelling corrections and clean-up of documentation.

### 2.1.0 - Oct 10, 2015
* Added watch ability that will `touch` an assembly if any of its dependancies are changed, added or removed.
* Updated documentation
* Updated dependancies
* Corrected code to default to use the project folder name for locale files If the default of `'strings_??.json'` can not be found.
* Corrected tests to perform correctly with the code fix above.

### 2.0.0 - Aug 03, 2015
* Converted the output path to not include the pathname where the `assembly.json` file lives. This can be overridden, to produce the output in the same location as previous versions, by setting the option `useOldDest` to true in the `assemble()` command. (See [README.md](README.md) for more information.)

### 1.1.2 - Mar 12, 2015
* Moved the locale and template output to before the code output to make sure code had access to locale and template data.
* Adjusted tests to match output movement
* Readme changes to look better on npmjs.org (I hope)

### 1.1.1 - Jan 14, 2015
* Spelling and grammar fixes to documents.
* Corrected MD code to work better on github
* More updated to documentation

### 1.1.0 - Jan 2, 2015
Some changes were breaking so I updated the minor number.
* Changed license to MIT
* Updated main README.md
* Added README.md in the plugins folder to describe plug-ins, how to write them, and what plug-ins are currently available.  
* Added `assemblyFileName` as an option sent into all plug-ins.
* Updated [./plugins/README.md](./plugins/README.md) to include `FILE_PRE`, `FILE_POST`, `INLINE_PRE`, and `INLINE_POST` . Added and corrected examples.
* Fixed the calling of plug-ins to be at the correct times.
* Created new plug-in: `fileNameProvider.js`to solve Issue #2.
* Removed `assembly.assemblies` and replaced with `assembly.subs` (*Breaking from version 1.0.4*).
* Created new plug-in: `oldSubAssemblies.js`to provide backwards compatibility with version 1.0.4.
* Corrected the output path so `gulp.dest()` will work correctly.
* Updated [./plugins/PLUGINLIST.MD](./plugins/PLUGINLIST.MD) to include new file `fileNameProvider.js` and `oldSubAssemblies.js` plug-ins.
* Spelling correction in main [README.md](README.md)
* Removed non-used and empty test files.
* Added tests for assemblies,js, globArray.js and plugin.js
* Linted and corrected all the testdata files.
* Added a clear function to the plugin.js file.
* Added "assemblyFileName" to the params sent to all plug-ins
* Added version information to my plug-ins
* Renamed the `testdata/main/sub1/local` folder to `testdata/main/sub1/locale`
* Updating License file to include 2014 and 2015.
* Updated docs for option `exposeLang` and added option `globalObj` with description.
* Alphabetized my plug-in list.
* Added comments into assemblies.js and moved the code to process POST plug-ins to the correct place (Before sub-assemblies)
* Changed the default global object used when exposing the assembly lang object to `globalObj` with the default of `window.components`
* Fixed test data to match what is correctly generated.


### 1.0.4
* Updated main [README.md](README.md)
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
