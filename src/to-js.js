const loaderUtils = require('loader-utils');
const importDB = require('./import-db');
const { compact } = require('./utils');
const {
  jsRequire,
  jsArrayFromList,
  jsObjectFromList
} = require('./utils/code');

const stringify = JSON.stringify;

function createLocalValueJS (exportedSymbols) {
  return jsArrayFromList(exportedSymbols, ({name, type, path}) => {
    if (type === 'local') {
      return stringify(name);
    }

    if (type === 'imported-item') {
      return jsArrayFromList([jsRequire(path), stringify(name)]);
    }
  });
}

function *generateKeyValuePairs(exports, createKeyVariations = $1 => [$1], createKeyVariationsArgs = []) {
  for (const { name, value } of exports) {
    const keys = createKeyVariations(name, ...createKeyVariationsArgs);

    for (const key of keys) {
      yield [key, value];
    }
  }
}

function *generateVariableVariations(key, { camelize }) {
  yield key;

  if (camelize === true) {
    yield key.replace(/\W(\w)/g, (_, $2) => $2.toUpperCase());
  }
}

function createLocalsJS(exports, options) {
  const keyValuePairs = generateKeyValuePairs(exports, generateVariableVariations, [options]);

  return jsObjectFromList(keyValuePairs, ([key, value]) => [key, createLocalValueJS(value)]);
}

function createNamespaceAccessorsReducer(accum, name) {
  return accum + `[${stringify(name)}]`;
}

function processCSS(css) {
  return stringify(css).replace(/%__imported_item__\d+__%/g, function (match) {
    const { namespace, path, name } = importDB.get(match);
    const parsedNamespace = compact(namespace.concat(name)).reduce(createNamespaceAccessorsReducer, jsRequire(path));

    return `" + ${parsedNamespace} + "`;
  });
}

module.exports = function toJS (css, imports, exports, loader, options) {
  const safeCSSModulePath = loaderUtils.stringifyRequest(loader, require.resolve('./_css-module.js'));
  const moduleID = loaderUtils.getHashDigest(css, 'md5', 'hex');

  return `
var builder = require(${safeCSSModulePath}).cssModuleBuilder;

exports.default = builder(
${stringify(moduleID)},
${processCSS(css)},
${createLocalsJS(exports, options)},
${jsArrayFromList(imports, jsRequire)}
);

module.exports = exports.default;`;
};
