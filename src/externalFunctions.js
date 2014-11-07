var fns = {
"formatFunction":   "String.prototype.format = function() {\n"+
                    " var text = this;\n"+
                    "\n"+
                    " var replaceTokens = function(text, key, value) {\n"+
                    "  return text.replace(new RegExp('\\{' + key + '\\}', 'gm'), value);\n"+
                    " };\n"+
                    "\n"+
                    " var iterateTokens = function(obj, prefix) {\n"+
                    "  for(var p in obj) {\n"+
                    "   if(typeof(obj[p]) === 'object') {\n"+
                    "    iterateTokens(obj[p], prefix + p + '.');\n"+
                    "   } else {\n"+
                    "    text = replaceTokens(text, prefix + p, obj[p]);\n"+
                    "   }\n"+
                    "  }\n"+
                    " }\n"+
                    "\n"+
                    " if ((arguments.length > 0) && (typeof arguments[0] === 'object')) { //process name value pairs\n"+
                    "  iterateTokens(arguments[0], '');\n"+
                    " }\n"+
                    " else {\n"+
                    "  // replacement by argument indexes\n"+
                    "  var i = arguments.length;\n"+
                    "  while (i--) {\n"+
                    "   text = replaceTokens(text, i, arguments[i]);\n"+
                    "  }\n"+
                    " }\n"+
                    "\n"+
                    " return text;\n"+
                    "};\n",

"getLangFunction":  "window.__getLangObj = function(locale, langKeys, validLocales, langs) {\n"+
                    " var temp, i, len = langKeys.length, lang = {};\n"+
                    " locale = (typeof(locale) === 'string' ? locale : locale[0]).split('-')[0];\n"+
                    " if (validLocales.indexOf(locale)<0) {\n"+
                    "  locale = '{locale}';\n"+
                    " }\n"+
                    " switch (locale) {\n"+
                    "  case 'ke':\n"+
                    "  case 'zz':\n"+
                    "   for(i = 0; i < len; i++) {\n"+
                    "    temp = (locale==='ke'?'['+langKeys[i]+']':'[sub2.'+langKeys[i]+']');\n"+
                    "    lang[langKeys[i]] = temp;\n"+
                    "   };\n"+
                    "   break;\n"+
                    "  default:\n"+
                    "   for(i = 0; i < len; i++) {\n"+
                    "    lang[langKeys[i]] = langs[locale][i];\n"+
                    "   };\n"+
                    "   break;\n"+
                    " }\n"+
                    " return lang;\n"+
                    "}\n"
};

module.exports = {
  "template": function(options) {
    return (fns.formatFunction + "\n" + fns.getLangFunction).replace(/\{locale\}/gm, options.locale);
  }
};
