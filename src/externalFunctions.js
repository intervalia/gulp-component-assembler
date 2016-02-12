/* globals __gca_formatStr */
var fns = {
  __gca_formatStr: function(txt, obj) {
    // Template bindings (Angular, Polymer, etc.) need to be excluded, which requires two
    // regexs. The first will grab all binding and translation like strings, the second will
    // exclude any strings that stat with more than one open bracket
    var potentialSubstitutionsRegex = /\{*?[^{]+\}/g;
    var trueSubstitutionsRegex = /^\{([^{}]+)\}/;

    if (typeof obj !== "object") {
      obj = Array.prototype.slice.call(arguments, 1);
    }

    return txt.replace(potentialSubstitutionsRegex, function (fullKey) {
      // ensure it's a translation binding and not a template binding
      if (trueSubstitutionsRegex.test(fullKey)) {
        return fullKey.replace(trueSubstitutionsRegex, function(match, key) {
          return obj[key] === undefined ? match : obj[key];
        });
      }
      else {
        return fullKey;
      }
    });
  },

  __gca_getTemplateStr: function(templateList, key, lang) {
    if (!templateList[key]) {
      console.warn("No template named '" + key + "'");
    }

    if (lang) {
      return __gca_formatStr(templateList[key] || "", lang);
    }
    else {
      return (templateList[key] || "");
    }
  },

  __gca_getLang: function(locales, langKeys, validLocales, langs, assemblyName, defaultLocale) {
    var locale = defaultLocale, language, i, len = langKeys.length, lang = {};
    locales = (typeof locales === 'string' ? [locales] : locales);
    for (i = 0; i < locales.length; i++) {
      language = locales[i].split('-')[0];
      if (validLocales.indexOf(language) !== -1) {
        locale = language;
        break;
      }
    }

    switch (locale) {
      case 'ke':
      case 'zz':
        for(i = 0; i < len; i++) {
          lang[langKeys[i]] = (locale==='ke'?'['+langKeys[i]+']':'['+assemblyName+'.'+langKeys[i]+']');
        }
        break;
      default:
        for(i = 0; i < len; i++) {
          lang[langKeys[i]] = langs[locale][i];
        }
        break;
    }

    return lang;
  }
};

module.exports = {
  "template": function(options) {
    var content = "// Helper functions for component files built with the gulp-component-assembler\n"+
                  "// https://github.com/intervalia/gulp-component-assembler\n"+
                  "// See the option: useExternalLib in the README.md file\n"+
                  "(function(window){\n";
    Object.keys(fns).forEach(function(key) {
      content += "  window."+key+" = "+fns[key].toString() + ";\n\n";
    });

    return content+"})(window);\n";
  },
  "fns": fns
};
