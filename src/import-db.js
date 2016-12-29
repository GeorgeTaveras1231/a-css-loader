const stringify = JSON.stringify;
const { jsRequire } = require('./utils/code');
const { compact } = require('underscore');

// global import db :/
const db = [];

function createNamespaceAccessorsReducer(accum, name) {
  return accum + `[${stringify(name)}]`;
}

class ImportRecord {
  constructor(path, namespace, name) {
    this.type = 'imported-item';
    this.path = path;
    this.name = name;
    this.namespace = namespace;
  }

  fullNamespace() {
   return compact(this.namespace.concat(this.name));
  }

  toJS() {
    return this
      .fullNamespace()
      .reduce(createNamespaceAccessorsReducer, jsRequire(this.path));
  }
}

exports.IMPORTED_SYMBOL_PATTERN = /%__imported_item__\d+__%/g

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
exports.createImportedName = function (namespace = []) {
  return function (importedName, path) {
    const currentIndex = index++;
    const key = `%__imported_item__${currentIndex}__%`;

    db[currentIndex] = new ImportRecord(path, namespace, importedName);

    return key;
  }
};


