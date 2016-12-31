const path = require('path');

module.exports = {
  entry: {
    'dep-a': './dep-a.css',
    'dep-b': './dep-b.css'
  },
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'node_modules'),
    filename: '[name]/index.js',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['a-css-loader'],
      }
    ],
  },
  resolveLoader: {
    modulesDirectories: [
      path.resolve(__dirname, '..', '..', '..')
    ]
  }
};
