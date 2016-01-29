var fs = require('fs');
var path = require('path');
var PluginError = require('gulp-util').PluginError;
var PLUGIN_NAME = require("./pluginName");

function processLocales(baseLocalePath, localeFileName, assemblyName, options) {
  "use strict";

  var key, keys = [], len, keyStr, contents = "";
  var translations, strings, localeList = [];
  var supportTransKeys = !!options.supportTransKeys;

  options.localeVar = options.localeVar || "window.locale";

  if (supportTransKeys) {
    localeList =["zz","ke"];
  }

  translations = readLocaleFiles(baseLocalePath, localeFileName, options.locale);
  if (translations && translations.key) {
    contents += "var langKeys = "+JSON.stringify(translations.key)+";\n";
    // Output the langs table.
    contents += "var langs = {\n";
    translations.langs.sort().forEach(function(locale, index) {
      localeList.push(locale);
      contents +=  " // Included locale file: " + localeFileName + "_" + locale + ".json\n";
      strings = [];

      translations.key.forEach(function(key, keyIndex) {
        if (options.tagMissingStrings) {
          strings.push(translations[locale][key] || "-*"+(translations[options.locale][key] || "Not Found")+"*-");
        }
        else {
          strings.push(translations[locale][key] || translations[options.locale][key] || "");
        }
      });
      contents += ' "'+locale+'": ' + JSON.stringify(strings);
      if (index >= len) {
        contents += "\n";
      } else {
        contents += ",\n";
      }
    });
    contents += "};\n";
    // Output the validLocales and the routine to get the desired lang object.
    contents += "var validLocales = "+JSON.stringify(localeList.sort())+";\n\n";
    if(!options.useExternalLib) {
      contents += "function getLang(locale) {\n"+
                  " var temp, i, len = langKeys.length, lang = {};\n"+
                  " locale = (typeof(locale) === 'string' ? locale : locale[0]).split('-')[0];\n"+
                  " if (validLocales.indexOf(locale)<0) {\n"+
                  "  locale = '"+options.locale+"';\n"+
                  " }\n";
      if (supportTransKeys) {
        // Support the special locales of ke[key] and zz[assembly.key]
        contents += " switch (locale) {\n"+
                    "  case 'ke':\n"+
                    "  case 'zz':\n"+
                    "   for(i = 0; i < len; i++) {\n"+
                    "    temp = (locale==='ke'?'['+langKeys[i]+']':'["+assemblyName+".'+langKeys[i]+']');\n"+
                    "    lang[langKeys[i]] = temp;\n"+
                    "   }\n"+
                    "   break;\n"+
                    "  default:\n"+
                    "   for(i = 0; i < len; i++) {\n"+
                    "    lang[langKeys[i]] = langs[locale][i];\n"+
                    "   }\n"+
                    "   break;\n"+
                    " }\n";
      }
      else {
        // Don't support the two special locales.
        contents += " for(i = 0; i < len; i++) {\n"+
                    "  lang[langKeys[i]] = langs[locale][i];\n"+
                    " }\n";
      }

      // Return the correct lang object
      contents += " return lang;\n"+
                  "}";
    }
    else {
      contents += "function getLang(locale) {\n"+
                  " return __getLangObj(locale, langKeys, validLocales, langs);\n"+
                  "}";
    }
    // set the lang variable
    contents += "\n\nvar lang = getLang("+options.localeVar+" || '"+options.locale+"');\n";

    if (options.exposeLang) {
      var globalObj = "window."+(options.globalObj || "components");
      var globalAssembly = globalObj+"."+assemblyName;
      contents += globalObj      + " = " + globalObj      + " || {};\n";
      contents += globalAssembly + " = " + globalAssembly + " || {};\n";
      contents += globalAssembly + ".lang = lang;\n";
    }
  }

  return contents;
}

function readLocaleFiles(baseLocalePath, baseName, defaultLocale) {
  var files = fs.readdirSync(baseLocalePath),
      re = baseName + "_(.*).json",
      langs = {"langs":[]};

  if(!files || files.length === 0) {
    return null;
  }

  files = files.forEach(function(file) {
    var fileContents, lang, data, key, toks = file.match(re);

    if(toks) {
      lang = toks[1];
      fileContents = fs.readFileSync(path.join(baseLocalePath, file), {"encoding": "utf-8"});

      try {
        data = JSON.parse(fileContents);
        langs[lang] = data;
        langs.langs.push(lang);
      } catch(e) {
        throw new PluginError(PLUGIN_NAME, "Unable to parse locale file: " + path.join(baseLocalePath, file) + ":: " + e);
      }

      if (lang === defaultLocale) {
        langs.key = [];
        for (key in data) {
          langs.key.push(key);
        }
      }
    }
  });

  return langs;
}

module.exports = {
  "process": processLocales
};
