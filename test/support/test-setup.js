const webpackCompile = require('../support/webpack-compile');
const css = require('css');

module.exports = function setup(config) {
  return function (done) {
    webpackCompile(config).then((modules) => {
      this.cssModule = modules['result.js'];
      this.parsedCSS = css.parse(this.cssModule.toString());
    })
    .then(done)
    .catch(done);
  }
};
