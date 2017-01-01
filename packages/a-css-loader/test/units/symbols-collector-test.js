const assert = require('assert');
const { ImportRecord, SymbolsCollector } = require('../../src/symbols-collector');

describe('ImportRecord', () => {
  describe('#fullNamespace', () => {
    it('returns the full namespace for the import', () => {
      const subject = new ImportRecord('', ['a', 'b'], 'c');
      const subject2 = new ImportRecord('', ['a', 'b'], null);

      assert.deepEqual(subject.fullNamespace(), ['a', 'b', 'c']);
      assert.deepEqual(subject2.fullNamespace(), ['a', 'b']);
    });
  });

  describe('#toJS', () => {
    it('returns the code the access the import', () => {
      const subject = new ImportRecord('a/b/c', ['A', 'B'], 'C');
      assert.equal(subject.toJS(), 'require("a/b/c")["A"]["B"]["C"]');
    });
  });
});

describe('SymbolsCollector', () => {
  describe('ImportedItemCollectorAgent', () => {
    it('creates import records and provides keys to look them up', () => {
      const subject = new SymbolsCollector;
      const collectorAgent = subject.createImportedItemCollectorAgent(['namespaceA']);

      /* Create an imported items */
      const lookupKey = collectorAgent('itemName', '/item/path');

      const importedItem = subject.getImportedItem(lookupKey);

      assert.equal(importedItem.name, 'itemName');
      assert.equal(importedItem.path, '/item/path');
      assert.deepEqual(importedItem.namespace, ['namespaceA']);
    });
  });

  describe('#urls', () => {
    it('returns urls from imported items', () => {
      const subject = new SymbolsCollector;
      const collectorAgent = subject.createImportedItemCollectorAgent(['namespaceA']);

      collectorAgent('itemName', '/item/path');

      const urls = [...subject.urls()];
      assert.equal(urls[0], '/item/path');
    });

    it('returns added urls', () => {
      const subject = new SymbolsCollector;

      subject.addUrl('/a/b/c');

      const urls = [...subject.urls()];
      assert.equal(urls[0], '/a/b/c');
    });
  });

  describe('#exports', () => {
    it('returns imported symbols that are exported', () => {
      const subject = new SymbolsCollector;
      const collectorAgent = subject.createImportedItemCollectorAgent(['namespaceA']);

      const lookupKey = collectorAgent('itemName', '/item/path');

      subject.addExportItem({ name: 'exportedKey', values: `${lookupKey} local-var` });

      const exports = [...subject.exports()];
      assert.deepEqual(exports, [
        {
          name: 'exportedKey',
          values: [
            {
              type: 'imported-item',
              namespace: [ 'namespaceA' ],
              name: 'itemName',
              path: '/item/path'
            },
            {
              type: 'local',
              value: 'local-var'
            }
          ]
        }
      ]);
    });
  });
});
