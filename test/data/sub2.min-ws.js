// Assembly: sub2

(function(window,document,undefined) {
/*
 * Included File: f1.js
 */
console.log("main/sub2/f1.js");


var templateList = {
 // Included template file: border.html
 "border": '<div> <div class="header">This is the header</div> <span>{YES}</span> <span>{NO}</span> <div>{TEST}</div> <div> <div> <div>BORDER!!!</div> </div> </div> </div>',
 // Included template file: frame.html
 "frame": '<div class="frame">This is the frame template</div>'
};

function getTemplateStr(key) {
 return templateList[key]||"";
}

function getTemplate(key) {
 var snip = document.createElement("div");
 $(snip).html(getTemplateStr(key));
 return snip;
}

})(window,document);
