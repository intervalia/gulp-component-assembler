// Assembly: sub2

(function(window,document,undefined) {
var langKeys = ["TEST","YES","NO","WHY"];
var langs = {
 // Included locale file: strings_de.json
 "de": ["Dies ist ein Test.","Ja","Nicht","Why?"],
 // Included locale file: strings_en.json
 "en": ["This is a test.","Yes","No","Why?"],
 // Included locale file: strings_es.json
 "es": ["Esta es una prueba.","Sí","No","Why?"],
 // Included locale file: strings_fr.json
 "fr": ["C'est un test.","Oui","Non","Why?"],
 // Included locale file: strings_it.json
 "it": ["Questo è un test.","Sì","No","Why?"],
 // Included locale file: strings_ja.json
 "ja": ["これはテストです。","はい","いいえ","Why?"],
 // Included locale file: strings_ko.json
 "ko": ["테스트입니다.","예","없음","Why?"],
 // Included locale file: strings_mn.json
 "mn": ["Энэ нь тест юм.","Тийм ээ","ямар ч","Why?"],
 // Included locale file: strings_nl.json
 "nl": ["Dit is een test.","Ja","Geen","Why?"],
 // Included locale file: strings_no.json
 "no": ["Dette er en test.","Ja","Nei","Why?"],
 // Included locale file: strings_pt.json
 "pt": ["Este é um teste.","Sim","Não","Why?"],
 // Included locale file: strings_ro.json
 "ro": ["Acesta este un test.","Da","Nu","Why?"],
 // Included locale file: strings_ru.json
 "ru": ["Это тест.","Да","Нет","Why?"],
 // Included locale file: strings_zh.json
 "zh": ["这是一个考验。","是的","无","Why?"],
};
var validLocales = ["de","en","es","fr","it","ja","ko","mn","nl","no","pt","ro","ru","zh"];

function getLang(locale) {
 var temp, i, len = langKeys.length, lang = {};
 locale = (typeof(locale) === 'string' ? locale : locale[0]).split('-')[0];
 if (validLocales.indexOf(locale)<0) {
  locale = 'en';
 }
 for(i = 0; i < len; i++) {
  lang[langKeys[i]] = langs[locale][i];
 }
 return lang;
}

var lang = getLang(window.locale || 'en');

var templateList = {
 // Included template file: border.html
 "border": '<div> <div class="header">This is the header</div> <span>{YES}</span> <span>{NO}</span> <div>{TEST}</div> <div> <div> <div>BORDER!!!</div> </div> </div> </div>',
 // Included template file: frame.html
 "frame": '<div class="frame">This is the frame template</div>'
};

function getTemplateStr(key) {
 return (templateList[key]||"").format(lang);
}

function getTemplate(key) {
 var snip = document.createElement("div");
 $(snip).html(getTemplateStr(key));
 return snip;
}
/*
 * Included File: f1.js
 */
console.log("main/sub2/f1.js");


})(window,document);
