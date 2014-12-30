var path = require('path');

function convertOldAssembliesToNewSubs(params) {
  var i, len;
  if (params.assembly.assemblies && !params.assembly.subs) {
    params.assembly.subs = [];
    len = params.assembly.assemblies.length;
    for( i = 0; i < len; i++ ) {
      params.assembly.subs.push(path.join(params.assembly.assemblies[i], "assembly.json"));
    }

    delete params.assembly.assemblies;
  }

  return "";
}

module.exports = convertOldAssembliesToNewSubs;
module.exports.version = "1.0.0";
