const path = require('path');
const extend = require('extend');

const fixturesPath = path.resolve.bind(null, __dirname, '..', 'fixtures');

module.exports = function ({ query }) {

  return {
    context: fixturesPath(),
    entry: {
      'modules-test': './modules-test.css'
    },
    output: {
      path: fixturesPath('build'),
      filename: '[name].js',
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          query,
          test: /\.css$/,
          loader: 'a-css-loader'
        }
      ],
    },
    resolveLoader: {
      modulesDirectories: [
        path.resolve(__dirname, '..', '..', '..')
      ]
    }
  };
}

