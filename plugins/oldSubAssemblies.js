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

  return;
}

module.exports = function(register, types) {
  register(convertOldAssembliesToNewSubs, types.BEFORE, 'oldSubAssemblies');
};
module.exports.version = "2.0.0";