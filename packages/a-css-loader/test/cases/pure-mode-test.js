const assertIncludesClassPattern = require('../support/assert-includes-class-pattern');
const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({
  context: 'pure-mode-test',
  query: {
    scopedNameFormat: 'pure__[local]',
    mode: 'pure'
  }
});

describe('pure-mode', () => {
  before(setup(webpackConfig));

  it('exports module locals', function () {
    assertIncludesClassPattern(this.cssModule.get('a-class'), 'pure__a-class');
  });
});
