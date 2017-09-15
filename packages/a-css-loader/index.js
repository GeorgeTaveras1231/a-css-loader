const postcss = require('postcss');

const modulesScope = require('postcss-modules-scope');
const extractImports = require('postcss-modules-extract-imports');
const localByDefault = require('postcss-modules-local-by-default');
const modulesValues = require('a-css-loader_postcss-modules-values');

const loaderUtils = require('loader-utils');
const cssnano = require('cssnano');
const extend = require('extend');

const { SymbolsCollector } = require('./src/symbols-collector');
const { cssModulesFinalSweeper, urlReplacer } = require('./src/postcss-plugins');
const toJS = require('./src/to-js');
const createClassNameGenerator = require('./src/create-class-name-generator');

const LOADER_NAME = 'a-css-loader';
const DEFAULT_OPTIONS = Object.freeze({
  mode: 'pure',
  scopedNameFormat: '[local]--[hash:5]',
  camelize: false,
  minimize: true
});

function postcssPlugins(symbolsCollector, loaderContext, {
  mode,
  scopedNameFormat,
  minimize,
  reduceIdents
}) {
  const localsAgent = symbolsCollector.createImportedItemCollectorAgent(['locals']);
  const urlsAgent = symbolsCollector.createImportedItemCollectorAgent([/* no namespace for url requires */]);

  const plugins = [
    localByDefault({ mode }),
    extractImports({ createImportedName: localsAgent }),
    urlReplacer({ createImportedName: urlsAgent }),
    modulesValues({ createImportedName: localsAgent }),
    modulesScope({ generateScopedName: createClassNameGenerator(scopedNameFormat, loaderContext) }) ,
    cssModulesFinalSweeper({ symbolsCollector })
  ];

  if (minimize) {
    const options = typeof minimize === 'object' ? minimize : {};

    if (typeof reduceIdents === 'boolean') {
      options.reduceIdents = reduceIdents;
    }

    plugins.push(cssnano(options));
  }

  return plugins;
}

module.exports = function (source) {
  this.cacheable();

  const symbolsCollector = new SymbolsCollector;
  const options = extend({}, DEFAULT_OPTIONS, loaderUtils.getLoaderConfig(this, LOADER_NAME));

  const callback = this.async();

  postcss(
    postcssPlugins(symbolsCollector, this, options)
  )
  .process(source)
  .then(({ css }) => {
    callback(null, toJS(css, symbolsCollector, this, options));
  })
  .catch(callback);
};
