const requireFromString = require('require-from-string');
const webpack = require('webpack');
const MemoryFs = require('memory-fs');

const mfs = new MemoryFs;

function getModules(assets) {
  const modules = {};

  for ( let file in assets ) {
    modules[file] = requireFromString(assets[file].source());
  }

  return modules;
}

module.exports = function (webpackConfig) {
  const compiler = webpack(webpackConfig);

  compiler.outputFileSystem = mfs;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        const { compilation } = stats;

        resolve(getModules(compilation.assets));
      }
    });
  });
}
