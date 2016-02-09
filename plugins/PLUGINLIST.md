Plug-in list
============

I want to keep a log of all plug-ins written for the `gulp-component-assembler` in one place. This is **your** place to advertise a plug-in you have created. If you want to add your plug-in to this list, please make a Pull-Request with your additions to this file.



## Plug-ins I supply

The source code for any plug-in that I write will be in the plugins folder of the `gulp-component-assembler` project.

I have written one plug-in to provide a different mechanism for loading template files. This is a feature that was needed by the FamilySearch team.

| Plug-in | Ver | Date | Description |
| --- | --- | --- | --- |
| fileNameProvider.js | 2.0.0 | 08 Feb 2016 | A plug-in to provide the variables __ASSEMBLY__ at the top of each assembly and __FILE__ before each file from the `files` array is included in the assembly. Resolution for [Issue #2](https://github.com/intervalia/gulp-component-assembler/issues/2) |
| oldSubAssemblies.js | 2.0.0 | 08 Feb 2016 | The `oldSubAssemblies.js` plug-in allows the user to continue to use the `assemblies` property in the `assembly.json` file to reference sub assemblies. All it does is converts the paths defined in the `assemblies` property into a list of files in the `subs` property. If there is already a `subs` property then this plug-in does nothing. This plug-in manipulates the `assembly.json` object before the rest of the of the assembly process occurs.  |
| oldTemplates.js | 2.0.0 | 08 Feb 2016 | The `oldTemplates.js` plug-in allows the FamilySearch team to continue load a single template file called `template.html` from the assembly folder. It also uses a different mechanism for loading the templates into the JavaScript code. |



## Plug-ins provided by others.

| Plug-in | Ver | Date Added | Description | URL |
| --- | --- | --- | --- | --- |
| - | - | - | - | - |
