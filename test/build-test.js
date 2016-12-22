const assert = require('assert');
const path = require('path');
const Module = require('module');
const fs = require('fs');
const requireFromString = require('require-from-string');

const webpack = require('webpack');
const webpackConfig = require('../build-test/webpack.config');
const MemoryFs = require('memory-fs');

function assertIncludesClassPattern(classListString, pattern) {
  const regexp = new RegExp(pattern);
  const classList = classListString.split(' ');

  assert(classList.some(c => regexp.test(c)),
    `Expected ${JSON.stringify(classListString)} to include pattern ${JSON.stringify(pattern.toString())}`);
}

describe('build', () => {
  before(function (done) {
    const compiler = webpack(webpackConfig)
    const mfs = new MemoryFs;

    compiler.outputFileSystem = mfs;
    compiler.run((err, stats) => {
      const { compilation } = stats;
      const bundlePath = path.join(compilation.outputOptions.path, compilation.outputOptions.filename);
      const code = compilation.assets['result.js'].source();

      this.cssModule = requireFromString(code);
      done();
    });
  });

  it('exports module locals', function () {
    assertIncludesClassPattern(this.cssModule.get('local'), /ff_local_/);
  });

  it('exports composed module locals', function () {
    const classList = this.cssModule.get('composed-local');
    assertIncludesClassPattern(classList, /^ff_local_/);
    assertIncludesClassPattern(classList, /^ff_composed-local_/);
  });


  it('exports locals composed from imports', function () {
    const classList = this.cssModule.get('composed-import');
    assertIncludesClassPattern(classList, /^ff_imported-local_/);
    assertIncludesClassPattern(classList, /^ff_composed-import_/);
  });

  it('exports custom values', function () {
    const value = this.cssModule.get('exported-value');
    assert.equal(value, 'true');
  });
});
