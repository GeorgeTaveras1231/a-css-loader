const stringify = JSON.stringify;
const { jsRequire } = require('./utils/code');
const { compact } = require('underscore');

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

exports.SymbolsCollector = class SymbolsCollector {
  constructor() {
    this.importedSymbols = []
    this.importedCSSUrls = new Set;
    this.exportedSymbols = new Set;

    this.importedSymbolsIndex = 0;
  }

  /**
   * Get import record
   *
   * @param key {string}
   */
  getImpoertedItem(lookupKey) {
    const match = /^%__imported_item__(\d+)__%$/.exec(lookupKey);
    return match && (this.importedSymbols[match[1]] || null);
  }

  addUrl(url) {
    this.importedCSSUrls.add(url);
  }

  addExportItem(value) {
    this.exportedSymbols.add(value);
  }

  *urls() {
    yield *this.importedCSSUrls;

    for (const importedItem of this.importedSymbols) {
      yield importedItem.path;
    }
  }

  *normalizedExportedValues(values) {
    for (const value of values.split(/\s+/)) {
      const importedItem = this.getImpoertedItem(value);

      if (importedItem) {
        yield importedItem;
      } else {
        yield { type: 'local', name: value };
      }
    }
  }

  *exports() {
    for (const { name, values } of this.exportedSymbols) {
      yield { name, value: [...this.normalizedExportedValues(values)] };
    }
  }

 createCollectorAgent (namespace = []) {
    /**
     * Callback for postcss-module-extract-imports
     * This generates a unique temporary value to place in the syntax tree but additionally stores
     * metadata about the created import.
     */
    return (importedName, path) => {
      const currentIndex = this.importedSymbolsIndex++;
      const key = `%__imported_item__${currentIndex}__%`;

      this.importedSymbols[currentIndex] = new ImportRecord(path, namespace, importedName);

      return key;
    }
  }
}


