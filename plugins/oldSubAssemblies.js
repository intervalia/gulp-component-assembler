var path = require('path');

function convertOldAssembliesToNewSubs(params) {
  var i, len;
  if (params.assembly.assemblies && !params.assembly.subs) {
    params.assembly.subs = [];
    params.assembly.assemblies.forEach(function(assembly) {
      params.assembly.subs.push(path.join(assembly, "assembly.json"));
    });

    delete params.assembly.assemblies;
  }

  return "";
}

module.exports = convertOldAssembliesToNewSubs;
module.exports.version = "1.0.1";
