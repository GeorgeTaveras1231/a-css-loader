const assert = require('assert');
const toJS = require('../../src/to-js');
const { SymbolsCollector } = require('../../src/symbols-collector');

describe('toJS', () => {
  before(function () {
    const symbolsCollector = new SymbolsCollector;
    const agent = symbolsCollector.createImportedItemCollectorAgent();

    const importedItemLookupKey = agent('importedName', '/path/to/file');

    /* TODO: Sepearate to another test*/
    /* This is currently here to cover bug when urls are repeated */
    agent('anotherItem', '/path/to/file');

    symbolsCollector.addUrl('another/url');

    symbolsCollector.addExportItem({
      name: 'a-key',
      values: `a b c ${importedItemLookupKey}`
    });

    this.result = toJS(
      '.a { color: red; }',
      symbolsCollector,
      {},
      {
        camelize: true
      }
    );

  });
  /* These test are really brittle but I atleast wanted to one on set of tests for this function */
  it('creates a webpack compatible js hunk', function () {
    assert(
      this.result.indexOf('cssModule.defineLocals([[["a-key","aKey"], ["a", "b", "c", [require("/path/to/file"), "importedName"]]]]);') > -1,
      `did not define locals \n${this.result}`
    );

    assert(
      this.result.indexOf('cssModule.importEach([require("another/url"), require("/path/to/file")])') > -1,
      `did not import modules \n${this.result}`
    );
  });

  describe('#requireBuilder', () => {
    it('requires the css-module-buulder and assigns it to builder var', () => {
      const result = toJS.requireBuilder();
      assert.equal('var builder = require("css-module-builder");', result);
    });
  });
});
