const webpackCompile = require('../support/webpack-compile');

module.exports = function setup(config) {
  return function (done) {
    webpackCompile(config).then((modules) => {
      this.cssModule = modules['result.js'];
    })
    .then(done)
    .catch(done);
  }
};
