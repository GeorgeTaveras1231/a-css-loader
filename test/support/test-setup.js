const requireFromString = require('require-from-string');
const webpackCompile = require('../support/webpack-compile');
const css = require('css');

module.exports = function setup(config) {
  return function (done) {
    webpackCompile(config).then((assets) => {
      this.cssModule = requireFromString(assets['result.js'].source());
      this.cssString = this.cssModule.toString();
      this.parsedCSS = css.parse(this.cssString);
      this.assets = assets;
    })
    .then(done)
    .catch(done);
  };
};
