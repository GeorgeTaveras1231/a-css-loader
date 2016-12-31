exports.values = function *values(obj) {
  if (typeof Object.values === 'function') {
    return yield *Object.values(obj);
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      yield obj[key];
    }
  }
};
