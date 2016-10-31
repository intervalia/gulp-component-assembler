/*jshint expr: true*/
/*jshint -W061 */

var locales = require('../../src/locales');
var path = require('path');
var should = require('should');

describe('\n    Testing the file locales.js', function () {
  var rootPath = path.resolve(".");

  /*
   * Test function: locales
   *
   */
  describe("Testing default options", function() {
    var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
    var localeFileName = "test";
    var assemblyName = "one";
    var window = {};
    var options = {
      locale: "en"  // the default locale set by index.js
    };

    var finaLangKeys = ['LABEL_PHONE_NUMBER'];
    var finalLangs = {
     "de": ["Telefonnummer"],
     "en": ["Phone Number"],
     "eo": ["[Þĥöñé Ñûɱƀéŕ----- П國カ내]"],
     "es": ["Número de teléfono"],
     "fr": ["Numéro de téléphone"],
     "it": ["Numero di telefono"],
     "ja": ["電話番号"],
     "ko": ["전화번호"],
     "pt": ["Número de Telefone"],
     "ru": ["Номер телефона"],
     "zh": ["電話號碼"],
    };
    var finalValidLocales = ["de","en","eo","es","fr","it","ja","ko","pt","ru","zh"];
    var finalLang =  { LABEL_PHONE_NUMBER: "Phone Number" };


    it('should create a list of language keys', function() {
      var langKeys, langs, validLocales, lang, getLang;

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finaLangKeys, langKeys);
    });

    it('should create a list of language values for each language', function() {
      var langKeys, langs, validLocales, lang, getLang;

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalLangs, langs);
    });

    it('should create a list of supported locales', function() {
      var langKeys, langs, validLocales, lang, getLang;

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalValidLocales, validLocales);
    });

    it('should create a function to get the langauge keys/values for a locale', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var finalGetLangRu = { LABEL_PHONE_NUMBER: "Номер телефона" };
      var finalGetLangEo = { LABEL_PHONE_NUMBER: "[Þĥöñé Ñûɱƀéŕ----- П國カ내]" };
      var finalGetLangJa = { LABEL_PHONE_NUMBER: "電話番号" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangRu, getLang('ru'));
      should.deepEqual(finalGetLangEo, getLang('eo'));
      should.deepEqual(finalGetLangJa, getLang('ja'));
    });

    it('should create an object of language keys/values for the current locale', function() {
      var langKeys, langs, validLocales, lang, getLang;

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalLang, lang);
    });

    it('getLang() should return the default locale values if the value is not defined in the current locale', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var baseLocalePath = path.join(rootPath, "testdata/localeTests/two");
      var finalGetLangEs = {
        SAMPLE: "This is a sample",
        LABEL_PHONE_NUMBER: "Número de teléfono"
      };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangEs, getLang('es'));
    });

    it('getLang() should accept an array of 2 letter language codes and return the first supported', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var acceptLanguage = ['ca', 'fj', 'de', 'en'];

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(getLang('de'), getLang(acceptLanguage));
    });

    it('getLang() should accept an array of 2 letter language, 2 letter locale codes and return the first supported', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var acceptLanguage = ['ca-de', 'fj-ja', 'en-gb', 'de'];

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(getLang('en'), getLang(acceptLanguage));
    });

    it('getLang() should return 4-letter codes when supported', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var acceptLanguage = ['ca-de', 'fj-ja', 'zh-cn', 'de'];

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(getLang('zh-cn'), getLang(acceptLanguage));
    });

    it('getLang() should fallback to a 2-letter code when the 4-letter code is unsupported', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var acceptLanguage = ['ca-de', 'fj-ja', 'zh', 'de'];

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(getLang('zh-cn'), getLang(acceptLanguage));
    });

    it('lang should use "window.locale" if it exists', function() {
      var langKeys, langs, validLocales, lang, getLang;

      window.locale = 'ru';
      var finalGetLangRu = { LABEL_PHONE_NUMBER: "Номер телефона" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangRu, lang);
    });

  });


  describe('Testing "localeVar" option', function() {
    var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
    var localeFileName = "test";
    var assemblyName = "one";
    var window = {};
    var options = {
      locale: "en",  // the default locale set by index.js
      localeVar: "FS.simpleLocale()"
    };

    it('lang should use localeVar if passed', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var FS = {simpleLocale: function() { return 'fr'; } };
      var finalGetLangFr = { LABEL_PHONE_NUMBER: "Numéro de téléphone" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangFr, lang);
    });
  });


  describe('Testing "supportTransKeys" option', function() {
    var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
    var localeFileName = "test";
    var assemblyName = "one";
    var window = {};
    var options = {
      locale: "en",  // the default locale set by index.js
      supportTransKeys: true
    };

    it('getLang() should support locale "ke" to return language keys', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var finalGetLangKe = { LABEL_PHONE_NUMBER: "[LABEL_PHONE_NUMBER]" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangKe, getLang('ke'));
    });

    it('getLang() should support locale "ke" to return language keys and the assembly they are used in', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var finalGetLangZz = { LABEL_PHONE_NUMBER: "[one.LABEL_PHONE_NUMBER]" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalGetLangZz, getLang('zz'));
    });
  });


  describe('Testing "exposeLang" option', function() {
    var baseLocalePath = path.join(rootPath, "testdata/localeTests/one");
    var localeFileName = "test";
    var assemblyName = "one";
    var window = {};
    var options = {
      locale: "en",  // the default locale set by index.js
      exposeLang: true
    };

    it('should add the lang to the window object name spaced by the assembly name', function() {
      var langKeys, langs, validLocales, lang, getLang;

      var finalLang =  { LABEL_PHONE_NUMBER: "Phone Number" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalLang, window.components.one.lang);
    });

    it('should use globalObj if passed', function() {
      var langKeys, langs, validLocales, lang, getLang;

      options.globalObj = 'test';
      var finalLang =  { LABEL_PHONE_NUMBER: "Phone Number" };

      /*
        will add to scope:
          variables: langKeys, langs, validLocales, lang
          functions: getLang()
      */
      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      should.deepEqual(finalLang, window.test.one.lang);
    });

  });
  
  describe("testing nested locales", function() {
    var baseLocalePath = path.join(rootPath, "testdata/localeTests/three");
    var localeFileName = "test";
    var assemblyName = "three";
    var window = {};
    var options = {
        locale: "en"
    };
    var finalLangs = {
    "en": [
        "First Names",
        "Last Names",
        "Male",
        "Female",
        "Match all terms exactly",
        "Match first names exactly",
        "Match last names exactly",
        "Match birthplace exactly"
    ],
    "es": [
        "Nombre(s)",
        "Apellido(s)",
        "Hombre",
        "Mujer",
        "Concordar todos los términos de forma exacta",
        "Concordar los nombres de forma exacta",
        "Concordar los apellidos de forma exacta",
        "Concordar el lugar de nacimiento de forma exacta"
    ],
    "fr": [
        "Prénoms",
        "Noms de famille",
        "Homme",
        "Femme",
        "Recherche exacte de tous les renseignements",
        "Recherche exacte des prénoms",
        "Recherche exacte des noms de famille",
        "Recherche exacte du lieu de naissance"
    ]};
     
    var finalKeys = [
      "given",
      "surname",
      "male",
      "female",
      "matchExact.all",
      "matchExact.givenname",
      "matchExact.surname",
      "matchExact.birthPlace"
    ];
    
    it('should support nested locales', function() {
      var langKeys, langs, validLocales, lang, getLang;

      eval(locales.process(baseLocalePath, localeFileName, assemblyName, options));

      console.log('finalLangs:', finalLangs);
      console.log('\n\nlangs:', langs);
      
      
      should.deepEqual(finalLangs, langs);
      should.deepEqual(finalKeys, langKeys);
    });

  });

});