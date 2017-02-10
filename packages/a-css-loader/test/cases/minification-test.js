const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({ context: 'minification-test' });


const webpackConfigTestOptions = configFactory({
  context: 'minification-test',
  query: {
    minimize: {
      discardUnused: { fontFace: false }
    }
  }
});

describe('minification', () => {
  describe('default', () => {
    before(setup(webpackConfig));

    it('minifies the css', function () {
      assert.equal(this.parsedCSS.stylesheet.rules.length, 2);
    });
  });

  describe('minimize options', () => {
    before(setup(webpackConfigTestOptions));

    it('minifies the css (and passes the options to cssnano)', function () {
      assert.equal(this.parsedCSS.stylesheet.rules.length, 3);
    });
  });
});
