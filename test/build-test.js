const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('./support/assert-includes-class-pattern');
const configFactory = require('./factories/webpack-config');
const webpackCompile = require('./support/webpack-compile');

describe('build', () => {
  before(function (done) {
    const webpackConfig = configFactory({
      query: { generateScopedName: 'modules-test__[local]' }
    });

    webpackCompile(webpackConfig).then((modules) => {
      this.cssModule = modules['modules-test.js'];
    })
    .then(done);
  });

  it('exports module locals', function () {
    assertIncludesClassPattern(this.cssModule.get('local'), /^modules-test__local$/);
  });

  it('exports composed module locals', function () {
    const classList = this.cssModule.get('composed-local');
    assertIncludesClassPattern(classList, /^modules-test__local$/);
    assertIncludesClassPattern(classList, /^modules-test__composed-local$/);
  });

  it('exports locals composed from imports', function () {
    const classList = this.cssModule.get('composed-import');
    assertIncludesClassPattern(classList, /^modules-test__imported-local$/);
    assertIncludesClassPattern(classList, /^modules-test__composed-import$/);

    /* Even if module is not a css file */
    assertIncludesClassPattern(classList, /^simple-module$/);
  });

  it('exports custom values', function () {
    const value = this.cssModule.get('exported-value');

    assert.equal(value, 'true');
  });

  it('generate the proper css', function () {
    const result = this.cssModule.toString();
  });
});
