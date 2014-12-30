// Assembly: sub1

(function(window,document,undefined) {
/*
 * Included File: file_sub1.js
 */
function fn1() {
  return {
    "name": "file_sub1",
    "location": "main/sub1"
  };
}

console.log(fn1().name);

/*
 * Included File: file_sub2.js
 */
function fn2() {
  return {
    "name": "file_sub2",
    "location": "main/sub2"
  };
}

console.log(fn2().name);

var langKeys = ["TEST","YES","NO"];
var langs = {
 // Included locale file: strings_de.json
 "de": ["Dies ist ein Test.","Ja","Nicht"],
 // Included locale file: strings_en.json
 "en": ["This is a test.","Yes","No"],
 // Included locale file: strings_es.json
 "es": ["Esta es una prueba.","Sí","No"],
 // Included locale file: strings_fr.json
 "fr": ["C'est un test.","Oui","Non"],
 // Included locale file: strings_it.json
 "it": ["Questo è un test.","Sì","No"],
 // Included locale file: strings_ja.json
 "ja": ["これはテストです。","はい","いいえ"],
 // Included locale file: strings_ko.json
 "ko": ["테스트입니다.","예","없음"],
 // Included locale file: strings_mn.json
 "mn": ["Энэ нь тест юм.","Тийм ээ","ямар ч"],
 // Included locale file: strings_nl.json
 "nl": ["Dit is een test.","Ja","Geen"],
 // Included locale file: strings_no.json
 "no": ["Dette er en test.","Ja","Nei"],
 // Included locale file: strings_pt.json
 "pt": ["Este é um teste.","Sim","Não"],
 // Included locale file: strings_ro.json
 "ro": ["Acesta este un test.","Da","Nu"],
 // Included locale file: strings_ru.json
 "ru": ["Это тест.","Да","Нет"],
 // Included locale file: strings_zh.json
 "zh": ["这是一个考验。","是的","无"],
};
var validLocales = ["de","en","es","fr","it","ja","ko","mn","nl","no","pt","ro","ru","zh"];

function getLang(locale) {
 var temp, i, len = langKeys.length, lang = {};
 locale = (typeof(locale) === 'string' ? locale : locale[0]).split('-')[0];
 if (validLocales.indexOf(locale)<0) {
  locale = 'fr';
 }
 for(i = 0; i < len; i++) {
  lang[langKeys[i]] = langs[locale][i];
 }
 return lang;
}

var lang = getLang(window.locale || 'fr');

})(window,document);
