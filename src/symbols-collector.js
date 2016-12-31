const stringify = JSON.stringify;
const { jsRequire } = require('./utils/code');
const { values } = require('./utils/object');
const { map } = require('./utils/generators');
const { compact } = require('underscore');

function createNamespaceAccessorsReducer(accumulator, name) {
  return accumulator + `[${stringify(name)}]`;
}

function *normalizedExportedValues(symbolsCollector, values) {
  for (const value of values.split(/\s+/)) {
    const importedItem = symbolsCollector.getImportedItem(value);

    if (importedItem) {
      yield importedItem;
    } else {
      yield { type: 'local', value };
    }
  }
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

class SymbolsCollector {
  constructor() {
    this.importedSymbols = {};
    this.importedCSSUrls = new Set;
    this.exportedSymbols = new Set;

    this.importedSymbolsIndex = 0;
  }

  getImportedItem(lookupKey) {
    return this.importedSymbols[lookupKey] || null;
  }

  addUrl(url) {
    this.importedCSSUrls.add(url);
  }

  addExportItem(value) {
    this.exportedSymbols.add(value);
  }

  *urls() {
    const urlsFromImportedItems = map(values(this.importedSymbols) , ({ path }) => path);
    const uniqueUrls = new Set(
      [
        ...this.importedCSSUrls,
        ...urlsFromImportedItems
      ]
    );

    yield *uniqueUrls;
  }

  *exports() {
    for (const { name, values } of this.exportedSymbols) {
      yield { name, values: [...normalizedExportedValues(this, values)] };
    }
  }

  createImportedItemCollectorAgent(namespace = []) {
    /**
     * Callback for postcss-module-extract-imports
     * This generates a unique temporary value to place in the syntax tree but additionally stores
     * metadata about the created import.
     */
    return (importedName, path) => {
      const currentIndex = this.importedSymbolsIndex++;
      const key = `%__imported_item__${currentIndex}__%`;

      this.importedSymbols[key] = new ImportRecord(path, namespace, importedName);

      return key;
    };
  }
}

exports.IMPORTED_SYMBOL_PATTERN = /%__imported_item__\d+__%/g;
exports.ImportRecord = ImportRecord;
exports.SymbolsCollector = SymbolsCollector;


