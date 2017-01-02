const path = require('path');
const OptimizeCSSAssets = require('optimize-css-assets-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');

const extractCSS = new ExtractText('application.css');

module.exports = {
  entry: './application.css',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'application.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: extractCSS.loader('!a-css-loader?'),
      }
    ],
  },
  plugins: [
    extractCSS,
    new OptimizeCSSAssets(),
  ]
};
