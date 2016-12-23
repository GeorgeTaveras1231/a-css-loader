const postcss = require('postcss');
const postcssScope = require('postcss-modules-scope');
const postcssExtractImports = require('postcss-modules-extract-imports');
const localByDefault = require('postcss-modules-local-by-default');
const loaderUtils = require('loader-utils');
const genericNames = require('generic-names');
const extend = require('extend');

const { createImportedName } = require('./src/import-db');
const { cssModulesParser, isSymbolsMessage } = require('./src/css-modules-parser-postcss');
const toJS = require('./src/to-js');

const LOADER_NAME = 'a-css-loader';

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  const config = extend({
    mode: 'pure'
  }, loaderUtils.getLoaderConfig(this, LOADER_NAME));

  postcss([
    localByDefault({
      mode: config.mode
    }),
    postcssExtractImports({ createImportedName }),
    postcssScope({ generateScopedName: genericNames(config.generateScopedName) }),
    cssModulesParser()
  ])
  .process(source)
  .then(({ css, messages }) => {
    const {imports, exports} = messages.find(isSymbolsMessage);

    callback(null, toJS(css, imports, exports, this));
  })
  .catch((err) => {
    callback(err);
  })
};
