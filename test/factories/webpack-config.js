const path = require('path');
const extend = require('extend');

const fixturesPath = path.resolve.bind(null, __dirname, '..', 'fixtures');

module.exports = function () {

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
          test: /\.css$/,
          loaders: [
            'a-css-loader?generateScopedName=ff_[local]_[hash:3]'
          ]
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

