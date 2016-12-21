const postcss = require('postcss');
const postcssScope = require('postcss-modules-scope');
const postcssExtractImports = require('postcss-modules-extract-imports');
const loaderUtils = require('loader-utils');
const genericNames = require('generic-names');

const { createImportedName } = require('./src/import-db');
const { cssModulesParser, isSymbolsMessage } = require('./src/css-modules-parser-postcss');
const toJS = require('./src/to-js');

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query);

  postcss([
    postcssExtractImports({ createImportedName }),
    postcssScope({ generateScopedName: genericNames(query.generateScopedName) }),
    cssModulesParser()
  ])
  .process(source)
  .then(({ css, messages }) => {
    const {imports, exports} = messages.find(isSymbolsMessage);

    callback(null, toJS(css, imports, exports));
  })
  .catch((err) => {
    callback(err);
  })
};
