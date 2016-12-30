const assert = require('assert');
const toJS = require('../../src/to-js');
const { SymbolsCollector } = require('../../src/symbols-collector');

describe('toJS', () => {
  /* These test are really brittle but I atleast wanted to one on set of tests for this function */
  it('creates a webpack compatible js hunk', () => {
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

    const result = toJS(
      '.a { color: red; }',
      symbolsCollector,
      {},
      {
        camelize: true
      }
    );

    assert(
      result.indexOf('cssModule.defineLocals([[["a-key","aKey"], ["a", "b", "c", [require("/path/to/file"), "importedName"]]]]);') > -1,
      `did not define locals \n${result}`
    );

    assert(
      result.indexOf('cssModule.requireAll([require("another/url"), require("/path/to/file")])') > -1,
      `did not import modules \n${result}`
    );
  });
});
