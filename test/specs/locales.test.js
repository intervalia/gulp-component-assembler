/*jshint expr: true*/
var locales = require('../../src/locales');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var should = require('should');

describe('\n    Testing the file locales.js', function () {
  var rootPath;

  beforeEach(function() {
    rootPath = path.resolve(".");
  });


  /*
   * Test function: locales
   *
   */
  describe("Testing values for 'localeVar' and 'locale'", function() {
    it('should use "en" and "window.locale"', function(done) {
      var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
      var localeFileName = "test";
      var assemblyName = "one";
      var options = {
        locale: "en",
        tagMissingStrings: true
      };
      var final = 'var langKeys = ["LABEL_PHONE_NUMBER"];\n'+
        'var langs = {\n'+
        ' // Included locale file: test_de.json\n'+
        ' "de": ["Telefonnummer"],\n'+
        ' // Included locale file: test_en.json\n'+
        ' "en": ["Phone Number"],\n'+
        ' // Included locale file: test_eo.json\n'+
        ' "eo": ["[Þĥöñé Ñûɱƀéŕ----- П國カ내]"],\n'+
        ' // Included locale file: test_es.json\n'+
        ' "es": ["Número de teléfono"],\n'+
        ' // Included locale file: test_fr.json\n'+
        ' "fr": ["Numéro de téléphone"],\n'+
        ' // Included locale file: test_it.json\n'+
        ' "it": ["Numero di telefono"],\n'+
        ' // Included locale file: test_ja.json\n'+
        ' "ja": ["電話番号"],\n'+
        ' // Included locale file: test_ko.json\n'+
        ' "ko": ["전화번호"],\n'+
        ' // Included locale file: test_pt.json\n'+
        ' "pt": ["Número de Telefone"],\n'+
        ' // Included locale file: test_ru.json\n'+
        ' "ru": ["Номер телефона"],\n'+
        ' // Included locale file: test_zh.json\n'+
        ' "zh": ["電話號碼"],\n'+
        '};\n'+
        'var validLocales = ["de","en","eo","es","fr","it","ja","ko","pt","ru","zh"];\n'+
        '\n'+
        'function getLang(locale) {\n'+
        ' var temp, i, len = langKeys.length, lang = {};\n'+
        ' locale = (typeof(locale) === \'string\' ? locale : locale[0]).split(\'-\')[0];\n'+
        ' if (validLocales.indexOf(locale)<0) {\n'+
        '  locale = \'en\';\n'+
        ' }\n'+
        ' for(i = 0; i < len; i++) {\n'+
        '  lang[langKeys[i]] = langs[locale][i];\n'+
        ' }\n'+
        ' return lang;\n'+
        '}\n'+
        '\n'+
        'var lang = getLang(window.locale || \'en\');\n';

      var content = locales.process(baseLocalePath, localeFileName, assemblyName, options);
      content.should.eql(final);
      done();
    });

    it('should use "fr" and "FS.locale"', function(done) {
      var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
      var localeFileName = "test";
      var assemblyName = "one";
      var options = {
        localeVar: "FS.locale",
        locale: "fr"
      };
      var final = 'var langKeys = ["LABEL_PHONE_NUMBER"];\n'+
        'var langs = {\n'+
        ' // Included locale file: test_de.json\n'+
        ' "de": ["Telefonnummer"],\n'+
        ' // Included locale file: test_en.json\n'+
        ' "en": ["Phone Number"],\n'+
        ' // Included locale file: test_eo.json\n'+
        ' "eo": ["[Þĥöñé Ñûɱƀéŕ----- П國カ내]"],\n'+
        ' // Included locale file: test_es.json\n'+
        ' "es": ["Número de teléfono"],\n'+
        ' // Included locale file: test_fr.json\n'+
        ' "fr": ["Numéro de téléphone"],\n'+
        ' // Included locale file: test_it.json\n'+
        ' "it": ["Numero di telefono"],\n'+
        ' // Included locale file: test_ja.json\n'+
        ' "ja": ["電話番号"],\n'+
        ' // Included locale file: test_ko.json\n'+
        ' "ko": ["전화번호"],\n'+
        ' // Included locale file: test_pt.json\n'+
        ' "pt": ["Número de Telefone"],\n'+
        ' // Included locale file: test_ru.json\n'+
        ' "ru": ["Номер телефона"],\n'+
        ' // Included locale file: test_zh.json\n'+
        ' "zh": ["電話號碼"],\n'+
        '};\n'+
        'var validLocales = ["de","en","eo","es","fr","it","ja","ko","pt","ru","zh"];\n'+
        '\n'+
        'function getLang(locale) {\n'+
        ' var temp, i, len = langKeys.length, lang = {};\n'+
        ' locale = (typeof(locale) === \'string\' ? locale : locale[0]).split(\'-\')[0];\n'+
        ' if (validLocales.indexOf(locale)<0) {\n'+
        '  locale = \'fr\';\n'+
        ' }\n'+
        ' for(i = 0; i < len; i++) {\n'+
        '  lang[langKeys[i]] = langs[locale][i];\n'+
        ' }\n'+
        ' return lang;\n'+
        '}\n'+
        '\n'+
        'var lang = getLang(FS.locale || \'fr\');\n';

      var content = locales.process(baseLocalePath, localeFileName, assemblyName, options);
      content.should.eql(final);
      done();
    });
  });

  describe("Testing missing data from locale files", function() {
    it('should use "en" default for "SAMPLE"', function(done) {
      var baseLocalePath = path.join(rootPath, "testdata/localeTests/two");
      var localeFileName = "test";
      var assemblyName = "two";
      var options = {
        localeVar: "window.locale",
        locale: "en"
      };
      var final = 'var langKeys = ["SAMPLE","LABEL_PHONE_NUMBER"];\n'+
        'var langs = {\n'+
        ' // Included locale file: test_en.json\n'+
        ' "en": ["This is a sample","Phone Number"],\n'+
        ' // Included locale file: test_es.json\n'+
        ' "es": ["This is a sample","Número de teléfono"],\n'+
        ' // Included locale file: test_fr.json\n'+
        ' "fr": ["This is a sample","Numéro de téléphone"],\n'+
        '};\n'+
        'var validLocales = ["en","es","fr"];\n'+
        '\n'+
        'function getLang(locale) {\n'+
        ' var temp, i, len = langKeys.length, lang = {};\n'+
        ' locale = (typeof(locale) === \'string\' ? locale : locale[0]).split(\'-\')[0];\n'+
        ' if (validLocales.indexOf(locale)<0) {\n'+
        '  locale = \'en\';\n'+
        ' }\n'+
        ' for(i = 0; i < len; i++) {\n'+
        '  lang[langKeys[i]] = langs[locale][i];\n'+
        ' }\n'+
        ' return lang;\n'+
        '}\n'+
        '\n'+
        'var lang = getLang(window.locale || \'en\');\n';

      var content = locales.process(baseLocalePath, localeFileName, assemblyName, options);
      content.should.eql(final);
      done();
    });

    it('should use "fr" default for "MONDAY"', function(done) {
      var baseLocalePath = path.join(rootPath, "testdata/localeTests/two");
      var localeFileName = "test";
      var assemblyName = "two";
      var options = {
        localeVar: "someFunction()",
        locale: "fr",
        tagMissingStrings: true
      };
      var final = 'var langKeys = ["MONDAY","LABEL_PHONE_NUMBER"];\n'+
        'var langs = {\n'+
        ' // Included locale file: test_en.json\n'+
        ' "en": ["-*Lundi*-","Phone Number"],\n'+
        ' // Included locale file: test_es.json\n'+
        ' "es": ["-*Lundi*-","Número de teléfono"],\n'+
        ' // Included locale file: test_fr.json\n'+
        ' "fr": ["Lundi","Numéro de téléphone"],\n'+
        '};\n'+
        'var validLocales = ["en","es","fr"];\n'+
        '\n'+
        'function getLang(locale) {\n'+
        ' var temp, i, len = langKeys.length, lang = {};\n'+
        ' locale = (typeof(locale) === \'string\' ? locale : locale[0]).split(\'-\')[0];\n'+
        ' if (validLocales.indexOf(locale)<0) {\n'+
        '  locale = \'fr\';\n'+
        ' }\n'+
        ' for(i = 0; i < len; i++) {\n'+
        '  lang[langKeys[i]] = langs[locale][i];\n'+
        ' }\n'+
        ' return lang;\n'+
        '}\n'+
        '\n'+
        'var lang = getLang(someFunction() || \'fr\');\n';

      var content = locales.process(baseLocalePath, localeFileName, assemblyName, options);
      content.should.eql(final);
      done();
    });
  });
});
