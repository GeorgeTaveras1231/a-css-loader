const path = require('path');
module.exports = {
  entry: path.resolve(__dirname, 'index.css'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'result.js',
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
      path.resolve(__dirname, '..', '..')
    ]
  }
};
