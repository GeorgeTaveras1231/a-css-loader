const assert = require('assert');
const css = require('css');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('result.css');

const webpackConfig = configFactory({
  context: 'extract-text-plugin-integration-test',
  plugins: [ extractCSS ],
  loaders: [
    {
      test: /\.css$/,
      loader: extractCSS.loader('!a-css-loader?')
    }
  ]
});

describe('extract-text-plugin-integration', () => {
  before(setup(webpackConfig));

  it('generates a separate css bundle', function () {
    const result = css.parse(this.assets['result.css'].source());

    const selectors = result.stylesheet.rules.map($1 => $1.selectors);
    assert.deepEqual(selectors, [ [ '.a--36665' ], [ '.a--7b81b' ], [ '.b--8cf29' ] ]);
  });
});
