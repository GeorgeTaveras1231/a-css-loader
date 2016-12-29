const postcss = require('postcss');

const modulesScope = require('postcss-modules-scope');
const extractImports = require('postcss-modules-extract-imports');
const localByDefault = require('postcss-modules-local-by-default');
const modulesValues = require('postcss-modules-values');

const loaderUtils = require('loader-utils');
const genericNames = require('generic-names');
const extend = require('extend');

const { createImportedName } = require('./src/import-db');
const { cssModulesParser, urlReplacer, isSymbolsMessage } = require('./src/css-modules-parser-postcss');
const toJS = require('./src/to-js');

const LOADER_NAME = 'a-css-loader';
const DEFAULT_OPTIONS = Object.freeze({
  mode: 'pure',
  generateScopedName: '[local]--[hash:5]',
  camelize: false
});

module.exports = function (source) {
  const options = extend({}, DEFAULT_OPTIONS, loaderUtils.getLoaderConfig(this, LOADER_NAME));

  const { mode, generateScopedName } = options;

  const callback = this.async();

  this.cacheable();

  postcss([
    localByDefault({ mode }),
    extractImports({ createImportedName: createImportedName(['locals']) }),
    urlReplacer({ createImportedName: createImportedName() }),
    modulesValues({ createImportedName: createImportedName(['locals']) }),
    modulesScope({ generateScopedName: genericNames(generateScopedName) }),
    cssModulesParser()
  ])
  .process(source)
  .then(({ css, messages }) => {
    const {imports, exports} = messages.find(isSymbolsMessage);

    callback(null, toJS(css, imports, exports, this, options));
  })
  .catch((err) => {
    callback(err);
  })
};
