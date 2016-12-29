const code = require('../../src/utils/code');
const assert = require('assert');

describe('jsRequire', () => {
  it('creates a js require string', () => {
    assert.equal(code.jsRequire('/a/b/c'), 'require("/a/b/c")');
  });
});

describe('jsArrayFromList', () => {
  it('creates a js array', () => {
    const result = code.jsArrayFromList([1, 2, 3, 'require("a/b/c")']);
    const result2 = code.jsArrayFromList([]);
    assert.equal(result, '[1, 2, 3, require("a/b/c")]');
    assert.equal(result2, '[]');
  });
});

describe('jsObjectFromList', () => {
  it('creates a js object', function () {
    const result = code.jsObjectFromList([['k', 'v'], ['d-k', 'v']]);
    const result2 = code.jsObjectFromList([]);

    assert.equal(result, '{"k": v, "d-k": v}');
    assert.equal(result2, '{}');
  });
});
