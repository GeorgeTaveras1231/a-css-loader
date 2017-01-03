const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({ context: 'minification-test' });

describe('minification', () => {
  before(setup(webpackConfig));

  it('minifies the css', function () {
    console.log(this.cssString);
    assert.equal(this.parsedCSS.stylesheet.rules.length, 2);
  });
});
