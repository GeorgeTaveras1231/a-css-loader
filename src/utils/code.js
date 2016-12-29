const stringify = JSON.stringify;

exports.jsRequire = function jsRequire(path) {
  return `require(${stringify(path)})`;
};

exports.jsArrayFromList = function jsArrayFromList(list, callback = $1 => $1, callbackArgs = []) {
  let js = '[ ';

  for(const value of list)  {
    js += callback(value, ...callbackArgs);
    js += ','
  }

  return js.slice(0, -1) + ']';
}

exports.jsObjectFromList = function jsObjectFromList(list, callback = $1 => $1, callbackArgs = []) {
  let js = '{ ';

  for(const item of list)  {
    const [key, value] = callback(item, ...callbackArgs);
    js += stringify(key);
    js += ': '
    js += value;
    js += ','
  }

  return js.slice(0, -1) + '}';
}
