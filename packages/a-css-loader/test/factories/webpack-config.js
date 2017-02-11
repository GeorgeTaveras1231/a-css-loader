const path = require('path');

const fixturesPath = path.resolve.bind(null, __dirname, '..', 'fixtures');

module.exports = ({
  query = {},
  entry = './main.css',
  context = '',
  filename = 'result',
  loaders = [
    {
      query,
      test: /\.css$/,
      loader: 'a-css-loader'
    },
    {
      test: /\.(jpg|woff)$/,
      loader: 'file-loader?name=generated-by-webpack-[hash:6].[ext]&emitFile=false'
    }
  ],
  plugins = []
}) => {
  return {
    context: fixturesPath(context),
    entry: entry,
    output: {
      path: fixturesPath('build'),
      filename: `${filename}.js`,
      libraryTarget: 'umd'
    },
    plugins,
    module: { loaders },
    resolveLoader: {
      modulesDirectories: [
        path.resolve(__dirname, '..', '..', '..'),
        'node_modules'
      ]
    }
  };
};

