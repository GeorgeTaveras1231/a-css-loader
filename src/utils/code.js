const stringify = JSON.stringify;

exports.jsRequire = function jsRequire(path) {
  return `require(${stringify(path)})`;
};

exports.jsArrayFromList = function jsArrayFromList(list, mapper = $1 => $1, callbackArgs = []) {
  let js = '';

  for(const value of list)  {
    js += mapper(value, ...callbackArgs);
    js += ', '
  }

  return '[' + js.slice(0, -2) + ']';
}

exports.jsObjectFromList = function jsObjectFromList(list, mapper = $1 => $1, callbackArgs = []) {
  let js = '';

  for(const item of list)  {
    const [key, value] = mapper(item, ...callbackArgs);
    js += stringify(key);
    js += ': '
    js += value;
    js += ', '
  }

  return '{' + js.slice(0, -2) + '}';
}
