const uuid = require('node-uuid');
const db = [];

exports.get = function get(key) {
  const match = /^%__imported_item__(\d+)__%$/.exec(key);
  return match && db[match[1]];
};

let index = 0;
exports.createImportedName = function createImportedName (importedName, path) {
  const currentIndex = index++;
  const key = `%__imported_item__${currentIndex}__%`;
  db[currentIndex] = { type: 'imported-item', path, name: importedName };

  return key;
}

