exports.map = function *map(iterator, mapper) {
  for (const value of iterator) {
    yield mapper(value);
  }
};
