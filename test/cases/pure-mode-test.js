const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const webpackCompile = require('../support/webpack-compile');

const webpackConfig = configFactory({
  entry: './pure-mode-test.css',
  query: {
    generateScopedName: 'pure__[local]',
    mode: 'pure'
  }
});

describe('pure-mode', () => {
  before(function (done) {
    webpackCompile(webpackConfig).then((modules) => {
      this.cssModule = modules['result.js'];
    })
    .then(done)
    .catch(done);
  });

  it('exports module locals', function () {
    assertIncludesClassPattern(this.cssModule.get('a-class'), 'pure__a-class');
  });
});
