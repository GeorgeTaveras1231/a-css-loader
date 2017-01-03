const stringify = JSON.stringify;

exports.jsRequire = function jsRequire(path) {
  return `require(${stringify(path)})`;
};

exports.jsArrayFromList = function jsArrayFromList(list) {
  let js = '';

  for(const value of list)  {
    js += value;
    js += ', ';
  }

  return '[' + js.slice(0, -2) + ']';
};
