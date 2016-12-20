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
