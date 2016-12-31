const code = require('../../src/utils/code');
const generators = require('../../src/utils/generators');
const assert = require('assert');

describe('code.jsRequire', () => {
  it('creates a js require string', () => {
    assert.equal(code.jsRequire('/a/b/c'), 'require("/a/b/c")');
  });
});

describe('code.jsArrayFromList', () => {
  it('creates a js array', () => {
    const result = code.jsArrayFromList([1, 2, 3, 'require("a/b/c")']);
    const result2 = code.jsArrayFromList([]);
    assert.equal(result, '[1, 2, 3, require("a/b/c")]');
    assert.equal(result2, '[]');
  });
});

describe('generators.map', () => {
  it('lazily maps values', () => {
    const gen = generators.map([1, 2, 3], n => n * 2);

    assert.equal(gen.next().value, 2);
    assert.equal(gen.next().value, 4);
    assert.equal(gen.next().value, 6);
  });
});
