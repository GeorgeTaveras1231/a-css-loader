const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({
  context: 'url-test',
  query: { mode: 'global' }
});

describe('url', () => {
  before(setup(webpackConfig));

  it('integrates urls with webpack', function () {
    const backgroundDeclaration = this.parsedCSS.stylesheet.rules[0].declarations[0].value.split(' ');

    assert.equal(backgroundDeclaration[0], "url('generated-by-webpack-2e7f69.jpg')");
  });
});
