const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

describe('repeated dependency', () => {
  before(setup(configFactory({ context: 'repeated-dependency-test', query: { mode: 'global' } })));

  before(function () {
    this.style = css.parse(this.cssModule.toString());
  });

  it('generates the proper css', function () {
    assert.equal(this.style.stylesheet.rules.length, 3);
  });

  it('concats css in the proper order', function () {
    const ruleSelectors = this.style.stylesheet.rules.map((r) => r.selectors);

    assert.deepEqual(ruleSelectors, [['.module-2'], ['.module-1'], ['.main']]);
  })
});
