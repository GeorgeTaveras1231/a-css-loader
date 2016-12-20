const postcss = require('postcss');
const postcssScope = require('postcss-modules-scope');
const postcssExtractImports = require('postcss-modules-extract-imports');
const loaderUtils = require('loader-utils');

const createImportedName = require('./src/create-imported-name');
const parserPlugin = require('./src/postcss-parser-plugin');
const toJS = require('./src/to-js');

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query);

  const processPromise = postcss([
    postcssExtractImports({ createImportedName }),
    postcssScope(),
    parserPlugin()
  ]).process(source);

  processPromise
  .then(({ css, messages }) => {
    const {imports, exports} = messages.find((m) => m.plugin === 'css-modules-parser');

    callback(null, toJS(css, imports, exports));
  })
  .catch((err) => {
    callback(err);
  })
};
