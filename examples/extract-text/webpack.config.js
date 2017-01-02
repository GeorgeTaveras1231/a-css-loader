const path = require('path');
const ExtractText = require('extract-text-webpack-plugin');

const css = new ExtractText('application.css');

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
        loader: css.loader('&remove=true!a-css-loader?'),
      }
    ],
  },
  plugins: [
    css
  ]
};
