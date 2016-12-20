/** Get unique list of locals
  * This is necessary to deal with locals imported from modules which compose locals that have
  * already been established by the given module
  *
  * Runtime is O(4n) time O(2n) space
  *
  * @param locals {object} dirty locals which may include duplicates
  */
exports.cleanLocals = function (locals) {
  var newLocals = {};
  var localSet;

  for (var key in locals) {
    if (!locals.hasOwnProperty(key)) continue;

    /* Use POJO as a string set instead of Set for older browsers */
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
    var node;

    if (cssCache) return cssCache;

    while(stack.length) {
      node = stack.pop();

      if (loaded[node.__module__.id]) {
        continue;
      }

      node.__module__.imports.forEach(function (i) {
        !loaded[i.__module__.id] && stack.push(i);
      });

      loaded[node.__module__.id] = true;
      cssCache = node.__module__.rawCSS + cssCache;
    }

    return cssCache;
  };
};
