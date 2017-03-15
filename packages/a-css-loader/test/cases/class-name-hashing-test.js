const assert = require('assert');
const css = require('css');

const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');


describe('build', () => {
  describe('hashed classes', function () {
    const webpackConfig = configFactory({
      context: 'class-name-hashing-test',
      query: {
        scopedNameFormat: '_[hash:5]',
        mode: 'global'
      },
    });

    before(setup(webpackConfig));

    it('creates hashes based on the css content', function () {
      const { rules } = this.parsedCSS.stylesheet;

      assert.equal(rules.length, 1);
      assert.equal(rules[0].selectors[0], '._85122');
    });
  });

  describe('format', function () {
    const webpackConfig = configFactory({
      context: 'class-name-hashing-test',
      query: {
        scopedNameFormat: '_[name]_[hash:5]',
        mode: 'global'
      },
    });

    before(setup(webpackConfig));

    it('supports other webpack format values', function () {
      const { rules } = this.parsedCSS.stylesheet;

      assert.equal(rules.length, 2);
      assert.equal(rules[0].selectors[0], '._b_85122');
      assert.equal(rules[1].selectors[0], '._a_85122');
    });
  });
});
