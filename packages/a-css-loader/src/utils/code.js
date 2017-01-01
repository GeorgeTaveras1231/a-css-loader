const stringify = JSON.stringify;

exports.jsRequire = function jsRequire(path) {
  return `require(${stringify(path)})`;
};

exports.jsArrayFromList = function jsArrayFromList(list, mapper = $1 => $1, callbackArgs = []) {
  let js = '';

  for(const value of list)  {
    js += mapper(value, ...callbackArgs);
    js += ', ';
  }

  return '[' + js.slice(0, -2) + ']';
};
