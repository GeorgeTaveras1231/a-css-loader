exports.cleanLocals = function (locals) {
  var newLocals = {};
  var localSet;
  for ( var key in locals ) {
    if (!locals.hasOwnProperty(key)) continue;

    localSet = {};

    locals[key].split(' ').forEach(function (local) {
      localSet[local] = true;
    });

    newLocals[key] = Object.keys(localSet).join(' ');
  }

  return newLocals;
}

exports.toStringBuilder = function () {

  var cssCache = ''
  return function toString() {
    var stack = [this];
    var loaded = {};

    if (cssCache) return cssCache;

    while(stack.length) {
      var head = stack.pop();

      if (loaded[head.__module__.id]) {
        continue;
      }

      head.__module__.imports.forEach(function (i) {
        !loaded[i.__module__.id] && stack.push(i);
      });

      loaded[head.__module__.id] = true;
      cssCache = head.__module__.rawCSS + cssCache;
    }

    return cssCache;
  };
};
