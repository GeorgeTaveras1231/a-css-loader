const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

describe('circular dependency', () => {
  before(setup(configFactory({ context: 'circular-dependency-test', query: { mode: 'global' } })));

  it('generates the proper css', function () {
    const style = css.parse(this.cssModule.toString());
    assert.equal(this.cssModule.toString().indexOf('Object'), -1);
    assert.equal(style.stylesheet.rules.length, 2);
  });
});
