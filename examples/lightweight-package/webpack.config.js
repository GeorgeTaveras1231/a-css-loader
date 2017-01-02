const path = require('path');

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
        loaders: ['a-css-loader'],
      }
    ]
  },
  externals: {
    'css-module-builder': true
  }
};
