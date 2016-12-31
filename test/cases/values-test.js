const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({
  context: 'values-test',
  query: {
    generateScopedName: 'modules-test__[local]',
    mode: 'global'
  },
});

describe('@value', () => {
  before(setup(webpackConfig));

  it('exports the values', function () {
    assert.equal(this.cssModule.get('small-font'), '10px');
  });

  it('exports the imported values', function () {
    assert.equal(this.cssModule.get('special-red'), 'red');
  });

  it('replaces the values', function () {
    const declarations  = this.parsedCSS.stylesheet.rules[0].declarations;
    assert.equal(declarations[0].value, '10px');
    assert.equal(declarations[1].value, 'red');
  });
});
