const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const webpackCompile = require('../support/webpack-compile');

const webpackConfig = configFactory({
  context: 'modules-test',
  query: {
    generateScopedName: 'modules-test__[local]',
    mode: 'global'
  },
});

describe('build', () => {
  before(function (done) {
    webpackCompile(webpackConfig).then((modules) => {
      this.cssModule = modules['result.js'];
    })
    .then(done)
    .catch(done);
  });

  describe('modules', function () {
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
  });

  describe('css', function () {
    before(function () {
      this.css = this.cssModule.toString();
    });

    it('removes @imports', function () {
      assert.ok(this.css.indexOf('@import') === -1);
    });
  });
});
