const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const webpackCompile = require('../support/webpack-compile');

const webpackConfig = configFactory({
  context: 'values-test',
  query: {
    generateScopedName: 'modules-test__[local]',
    mode: 'global'
  },
});

describe('@value', () => {
  before(function (done) {
    webpackCompile(webpackConfig).then((modules) => {
      this.cssModule = modules['result.js'];
    })
    .then(done)
    .catch(done);
  });

  it('exports the values', function () {
    assert.equal(this.cssModule.get('small-font'), '10px');
  });

  it('exports the imported values', function () {
    assert.equal(this.cssModule.get('special-red'), 'red');
  });

  it('replaces the values', function () {
    const declarations  = css.parse(this.cssModule.toString()).stylesheet.rules[0].declarations;
    assert.equal(declarations[0].value, '10px');
    assert.equal(declarations[1].value, 'red');
  });
});
