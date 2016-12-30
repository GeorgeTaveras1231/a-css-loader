'use strict';

const { compact } = require('underscore');
const { camelcase } = require('underscore.string');

const loaderUtils = require('loader-utils');

const { IMPORTED_SYMBOL_PATTERN } = require('./symbols-collector');;

const {
  jsRequire,
  jsArrayFromList,
  jsObjectFromList
} = require('./utils/code');

const stringify = JSON.stringify;

function createLocalValueJS (exportedSymbols) {
  return jsArrayFromList(exportedSymbols, ({name, value, type, path}) => {
    if (type === 'local') {
      return stringify(value);
    }

    if (type === 'imported-item') {
      return jsArrayFromList([jsRequire(path), stringify(name)]);
    }
  });
}

function *generateKeyValuePairs(exports, createKeyVariations = $1 => [$1], createKeyVariationsArgs = []) {
  for (const { name, values } of exports) {
    const keys = createKeyVariations(name, ...createKeyVariationsArgs);

    for (const key of keys) {
      yield [key, values];
    }
  }
}

function *generateKeyVariations(key, { camelize }) {
  yield key;

  if (camelize === true) {
    yield camelcase(key);
  }
}

function createLocalsJS(exports, options) {
  const keyValuePairs = generateKeyValuePairs(exports, generateKeyVariations, [options]);

  return jsObjectFromList(keyValuePairs, ([key, value]) => [key, createLocalValueJS(value)]);
}

function createNamespaceAccessorsReducer(accum, name) {
  return accum + `[${stringify(name)}]`;
}

function replaceImportedSymbols(css, symbolsCollector) {
  return stringify(css).replace(IMPORTED_SYMBOL_PATTERN, function (lookupKey) {
    const importRecord = symbolsCollector.getImportedItem(lookupKey);

    return `" + ${importRecord.toJS()} + "`;
  });
}

module.exports = function toJS (css, symbolsCollector, loader, options) {
  const safeCSSModulePath = loaderUtils.stringifyRequest(loader, require.resolve('./_css-module.js'));
  const moduleID = loaderUtils.getHashDigest(css, 'md5', 'hex');

  return `
var builder = require(${safeCSSModulePath});
var cssModule = builder.initialize(${stringify(moduleID)}, ${replaceImportedSymbols(css, symbolsCollector)});

cssModule.requireAll(${jsArrayFromList(symbolsCollector.urls(), jsRequire)});
cssModule.defineLocals(${createLocalsJS(symbolsCollector.exports(), options)});

module.exports = exports.default = cssModule;`;
};
