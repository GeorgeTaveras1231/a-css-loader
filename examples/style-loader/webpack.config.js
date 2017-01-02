const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './application.css',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'application.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new HTMLPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'a-css-loader'],
      }
    ],
  }
};
