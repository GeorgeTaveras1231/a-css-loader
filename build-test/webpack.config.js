const path = require('path');
module.exports = {
  context: path.resolve(__dirname),
  entry: './index.css',
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
