// Assembly: sub2

(function(window, document, $,undefined) {
/*
 * Included File: f1.js
 */
console.log("main/sub2/f1.js");


var templateList = {
 // Included template file: border.html
 "border": '<div>\n'+
 '  <div class="header">This is the header</div>\n'+
 '  <span>{YES}</span>\n'+
 '  <span>{NO}</span>\n'+
 '  <div>{TEST}</div>\n'+
 '  <div>\n'+
 '    <div>\n'+
 '      <div>BORDER!!!</div>\n'+
 '    </div>\n'+
 '  </div>\n'+
 '</div>\n',
 // Included template file: frame.html
 "frame": '<div class="frame">This is the frame template</div>\n'
};

function getTemplateStr(key) {
 return templateList[key]||"";
}

function getTemplate(key) {
 var snip = document.createElement("div");
 $(snip).html(getTemplateStr(key));
 return snip;
}

})(window, window.document, window.jQuery);
