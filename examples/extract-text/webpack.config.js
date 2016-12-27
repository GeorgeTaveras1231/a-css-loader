const path = require('path');
const requireFromString = require('require-from-string');
const StringifyAssetPlugin = require('../../src/webpack-stringify-asset-plugin');

module.exports = [
  {
    entry: './application.js',
    context: __dirname,
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: `application.js`,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: 'a-css-loader',
          query: { embedCss: false }
        }
      ],
    },
    resolveLoader: {
      modulesDirectories: [
        path.resolve(__dirname, '..', '..', '..'),
        'node_modules'
      ]
    }
  },
  {
    entry: './application.css',
    context: __dirname,
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: `application.css`,
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: 'a-css-loader'
        },
        {
          test: /\.jpg$/,
          loader: 'file-loader?name=generated-by-webpack-[hash:6].[ext]&emitFile=true'
        }
      ],
    },
    plugins: [
      new StringifyAssetPlugin('application.css')
    ],
    resolveLoader: {
      modulesDirectories: [
        path.resolve(__dirname, '..', '..', '..'),
        'node_modules'
      ]
    }
  }
];
