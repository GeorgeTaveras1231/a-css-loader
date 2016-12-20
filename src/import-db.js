const db = [];

/**
 * Get import metadata
 *
 * @param key {string}
 */
exports.get = function get(key) {
  const match = /^%__imported_item__(\d+)__%$/.exec(key);
  return match && (db[match[1]] || null);
};


/**
 * Callback for postcss-module-extract-imports
 * This generates a unique temporary value to place in the syntax tree but additionally stores
 * metadata about the created import.
 */
let index = 0;
exports.createImportedName = function createImportedName (importedName, path) {
  const currentIndex = index++;
  const key = `%__imported_item__${currentIndex}__%`;
  db[currentIndex] = { type: 'imported-item', path, name: importedName };

  return key;
}

