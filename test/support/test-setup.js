const requireFromString = require('require-from-string');
const webpackCompile = require('../support/webpack-compile');
const css = require('css');

module.exports = function setup(config) {
  return function (done) {
    webpackCompile(config).then((assets) => {
      this.cssModule = requireFromString(assets['result.js'].source());
      this.parsedCSS = css.parse(this.cssModule.toString());
      this.assets = assets;
    })
    .then(done)
    .catch(done);
  };
};
