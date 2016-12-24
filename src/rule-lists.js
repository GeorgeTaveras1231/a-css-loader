const importDb = require('./import-db');

function normalizeExports (exportedSymbolsAsString) {
  return exportedSymbolsAsString.split(' ').map((symbol) => {
    return importDb.get(symbol) || {
      type: 'local',
      name: symbol
    };
  });
}

exports.Imports = class Imports {
  constructor() {
    this.urls = new Set;
  }

  *[Symbol.iterator]() {
    for (let [url] of this.urls.entries()) {
      yield url;
    }
  }

  addUrl(url) {
    this.urls.add(url);
  }

  addFromImportedSymbols(rule) {
    rule.walkDecls((declaration) => {
      const importedItem = importDb.get(declaration.prop)

      this.urls.add(importedItem.path);
    });
  }
}


exports.Exports = class Exports {
  constructor() {
    this.declarations = [];

    /* Borrow iterator */
    this[Symbol.iterator] = Array.prototype[Symbol.iterator].bind(this.declarations);
  }

  addFromExportedSymbols(rule) {
    rule.walkDecls((declaration) => {
      this.declarations.push({
        name: declaration.prop, value: normalizeExports(declaration.value)
      });
    });
  }
}

