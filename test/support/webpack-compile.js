const webpack = require('webpack');
const MemoryFs = require('memory-fs');

const mfs = new MemoryFs;

module.exports = function (webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.outputFileSystem = mfs;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        const { compilation } = stats;

        if ( compilation.errors.length > 0 ) {
          reject(compilation.errors);
        } else {
          resolve(compilation.assets);
        }
      }
    });
  });
};
