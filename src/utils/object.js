exports.values = function *values(obj) {
  if (typeof Object.values === 'function') {
    yield *Object.values(obj);
  } else {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        yield obj[key];
      }
    }
  }
};
