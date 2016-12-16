const path = require('path');
module.exports = {
  entry: path.resolve(__dirname, 'index.css'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'result.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'icss-loader'
        ]
      }
    ],
  },
  resolveLoader: {
    modulesDirectories: [
      path.resolve(__dirname, '..', '..')
    ]
  }
};
