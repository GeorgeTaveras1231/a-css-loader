'use strict';

const { camelcase } = require('underscore.string');

const loaderUtils = require('loader-utils');

const { IMPORTED_SYMBOL_PATTERN } = require('./symbols-collector');

const {
  jsRequire,
  jsArrayFromList
} = require('./utils/code');

const { map } = require('./utils/generators');

const stringify = JSON.stringify;

function createLocalValueJS (exportedSymbols) {
  return jsArrayFromList(map(exportedSymbols, ({name, value, type, path}) => {
    if (type === 'local') {
      return stringify(value);
    }

    if (type === 'imported-item') {
      return jsArrayFromList([jsRequire(path), stringify(name)]);
    }
  }));
}

function *generateKeyVariations(key, { camelize }) {
  const variations = new Set([key]);

  if (camelize === true) {
    variations.add(camelcase(key));
  }

  yield *variations;
}

/* Create an array of arrays of arrays :)
 *
 * [
 *   [
 *     [], // keys
 *     []  // values
 *   ] // Local definition
 * ]
 *
 * */
function createLocalsJS(exports, options) {
  const keyValuePairs = map(exports, ({ name, values }) => {
    const keys = generateKeyVariations(name, options);
    const jsValue = createLocalValueJS(values);

    return jsArrayFromList([
      stringify([...keys]),
      jsValue
    ]);
  });

  return jsArrayFromList(keyValuePairs);
}

function replaceImportedSymbols(css, symbolsCollector) {
  return stringify(css).replace(IMPORTED_SYMBOL_PATTERN, function (lookupKey) {
    const importRecord = symbolsCollector.getImportedItem(lookupKey);

    return `" + ${importRecord.toJS()} + "`;
  });
}

function jsImportArray(urls) {
  return jsArrayFromList(map(urls, jsRequire));
}

function jsRequireBuilder() {
  return `var builder = ${jsRequire('css-module-builder')};`;
}

function toJS (css, symbolsCollector, loader, options) {
  const moduleID = loaderUtils.getHashDigest(css, 'md5', 'hex');

  return `
${jsRequireBuilder()}
var cssModule = builder.initialize(${stringify(moduleID)}, ${replaceImportedSymbols(css, symbolsCollector)});

cssModule.importEach(${jsImportArray(symbolsCollector.urls())});
cssModule.defineLocals(${createLocalsJS(symbolsCollector.exports(), options)});

module.exports = exports.default = cssModule;`;
}

module.exports = toJS;
module.exports.requireBuilder = jsRequireBuilder;
