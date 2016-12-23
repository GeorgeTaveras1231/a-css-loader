const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('./support/assert-includes-class-pattern');
const configFactory = require('./factories/webpack-config');
const webpackCompile = require('./support/webpack-compile');

describe('build', () => {
  before(function (done) {
    webpackCompile(configFactory()).then((modules) => {
      this.cssModule = modules['modules-test.js'];
    })
    .then(done);
  });

  it('exports module locals', function () {
    assertIncludesClassPattern(this.cssModule.get('local'), /ff_local_/);
  });

  it('exports composed module locals', function () {
    const classList = this.cssModule.get('composed-local');
    assertIncludesClassPattern(classList, /^ff_local_/);
    assertIncludesClassPattern(classList, /^ff_composed-local_/);
  });


  it('exports locals composed from imports', function () {
    const classList = this.cssModule.get('composed-import');
    assertIncludesClassPattern(classList, /^ff_imported-local_/);
    assertIncludesClassPattern(classList, /^ff_composed-import_/);

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
