const requireFromString = require('require-from-string');

module.exports = class StringifyAssetPlugin {
  constructor(asset) {
    this.asset = asset;
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const oldCSS = compilation.assets[this.asset].source();
      const module = requireFromString(oldCSS);

      compilation.assets[this.asset] = {
        source() {
          return module.toString();
        },
        size() {
          return this.source().length;
        }
      }

      callback();
    });
  }
}
