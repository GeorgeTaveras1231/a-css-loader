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

  add(rule) {
    rule.walkDecls((declaration) => {
      this.urls.add(importDb.get(declaration.prop).path);
    });
  }
}


exports.Exports = class Exports {
  constructor() {
    this.declarations = [];

    /* Borrow iterator */
    this[Symbol.iterator] = Array.prototype[Symbol.iterator].bind(this.declarations);
  }

  add(rule) {
    rule.walkDecls((declaration) => {
      this.declarations.push({
        name: declaration.prop, value: normalizeExports(declaration.value)
      });
    });
  }
}

