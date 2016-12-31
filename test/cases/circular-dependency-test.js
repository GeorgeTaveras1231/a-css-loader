const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

describe('circular dependency', () => {
  before(setup(configFactory({ context: 'circular-dependency-test', query: { mode: 'global' } })));

  it('generates the proper css', function () {
    assert.equal(this.cssString.indexOf('Object'), -1);
    assert.equal(this.parsedCSS.stylesheet.rules.length, 2);
  });
});
