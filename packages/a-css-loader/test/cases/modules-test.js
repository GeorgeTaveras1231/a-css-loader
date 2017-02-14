const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');


describe('build', () => {
  describe('modules', function () {
    const webpackConfig = configFactory({
      context: 'modules-test',
      query: {
        scopedNameFormat: 'modules-test__[local]',
        mode: 'global'
      },
    });

    before(setup(webpackConfig));

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

    describe('css', function () {
      before(function () {
        this.css = this.cssModule.toString();
        this.parsedCSS = css.parse(this.css);
      });

      it('removes @imports', function () {
        assert.ok(this.css.indexOf('@import') === -1);
      });

      it('removes @require', function () {
        assert.ok(this.css.indexOf('@require') === -1);
      });

      it('includes the css from required and imported modules', function () {
        assert(this.css.indexOf('.a-2-class') > 0);
      });

      it('includes the css from js module', function () {
        const ruleFromJs = this.parsedCSS.stylesheet.rules.find((rule) => {
          return rule.selectors.find($1 => $1 === '.simple-module');
        });

        assert(ruleFromJs);
      });
    });
  });

  describe('different export styles', function () {
    const webpackConfig = configFactory({
      context: 'modules-test',
      query: {
        mode: 'global',
        camelize: true
      },
    });

    before(setup(webpackConfig));


    describe('camelized', function () {
      it('provides camelCase variables', function () {
        const value = this.cssModule.get('exportedValue');

        assert.equal(value, 'true');
      });
    });
  });
});
