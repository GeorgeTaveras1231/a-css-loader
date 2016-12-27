const path = require('path');
const ExtractText = require('extract-text-webpack-plugin');

const css = new ExtractText('application.css');

module.exports = {
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
        // loader: css.loader('&remove=true!a-css-loader?'),
        loader: 'a-css-loader'
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader'
      }
    ],
  },
  plugins: [
    css
  ],
  resolveLoader: {
    modulesDirectories: [
      path.resolve(__dirname, '..', '..', '..'),
      'node_modules'
    ]
  }
}
