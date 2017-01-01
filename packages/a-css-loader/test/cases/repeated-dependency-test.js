const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

describe('repeated dependency', () => {
  before(setup(configFactory({ context: 'repeated-dependency-test', query: { mode: 'global' } })));

  it('generates the proper css', function () {
    assert.equal(this.parsedCSS.stylesheet.rules.length, 3);
  });

  it('concats css in the proper order', function () {
    const ruleSelectors = this.parsedCSS.stylesheet.rules.map((r) => r.selectors);

    assert.deepEqual(ruleSelectors, [['.module-2'], ['.module-1'], ['.main']]);
  });
});
