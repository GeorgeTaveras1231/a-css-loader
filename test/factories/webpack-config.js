const path = require('path');
const extend = require('extend');

const fixturesPath = path.resolve.bind(null, __dirname, '..', 'fixtures');

module.exports = function ({ query = {}, entry = './main.css', context = '', filename = 'result' }) {
  return {
    context: fixturesPath(context),
    entry: entry,
    output: {
      path: fixturesPath('build'),
      filename: `${filename}.js`,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          query,
          test: /\.css$/,
          loader: 'a-css-loader'
        },
        {
          test: /\.jpg$/,
          loader: 'file-loader?name=generated-by-webpack-[hash:6].[ext]&emitFile=false'
        }
      ],
    },
    resolveLoader: {
      modulesDirectories: [
        path.resolve(__dirname, '..', '..', '..'),
        'node_modules'
      ]
    }
  };
}

