const postcss = require('postcss');

const modulesScope = require('postcss-modules-scope');
const extractImports = require('postcss-modules-extract-imports');
const localByDefault = require('postcss-modules-local-by-default');
const modulesValues = require('postcss-modules-values');

const loaderUtils = require('loader-utils');
const genericNames = require('generic-names');
const extend = require('extend');

const { SymbolsCollector } = require('./src/symbols-collector');
const { cssModulesFinalSweeper, urlReplacer } = require('./src/postcss-plugins');
const toJS = require('./src/to-js');

const LOADER_NAME = 'a-css-loader';
const DEFAULT_OPTIONS = Object.freeze({
  mode: 'pure',
  scopedNameFormat: '[local]--[hash:5]',
  camelize: false
});

module.exports = function (source) {
  this.cacheable();

  const options = extend({}, DEFAULT_OPTIONS, loaderUtils.getLoaderConfig(this, LOADER_NAME));
  const symbolsCollector = new SymbolsCollector;

  const { mode, scopedNameFormat } = options;

  const callback = this.async();

  const localsAgent = symbolsCollector.createCollectorAgent(['locals']);
  const urlsAgent = symbolsCollector.createCollectorAgent([/* no namespace for url requires */]);
  postcss([
    localByDefault({ mode }),
    extractImports({ createImportedName: localsAgent }),
    urlReplacer({ createImportedName: urlsAgent }),
    modulesValues({ createImportedName: localsAgent }),
    modulesScope({ generateScopedName: genericNames(scopedNameFormat) }),
    cssModulesFinalSweeper({ symbolsCollector })
  ])
  .process(source)
  .then(({ css, messages }) => {
    callback(null, toJS(css, this, options, symbolsCollector));
  })
  .catch(callback);
};
