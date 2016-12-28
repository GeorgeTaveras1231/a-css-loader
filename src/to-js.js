const loaderUtils = require('loader-utils');
const importDB = require('./import-db');
const utils = require('./utils');

const stringify = JSON.stringify;

function processedExports (exportedSymbols) {
  return exportedSymbols.map((symbol) => {
    if (symbol.type === 'local') {
      return stringify(symbol.name);
    }

    if (symbol.type === 'imported-item') {
      return `[require(${stringify(symbol.path)}), ${stringify(utils.last(symbol.name))}]`;
    }
  }).join(',');
}

function exportsToJS(exports) {
  var localDefinitions = []
  for (let symbol of exports) {
    localDefinitions.push(`\t${stringify(symbol.name)}: [${processedExports(symbol.value)}]`);
  }

  return `{\n${localDefinitions.join(',\n')}}`;
}

function importsToJS(imports) {
  const requires = [];
  for (let url of imports) {
    requires.push(`\trequire(${stringify(url)})`);
  }

  return `[\n${requires.join(',\n')}\n]`;
}

function createNamespaceAccessorsReducer(accum, name) {
  return accum + `[${stringify(name)}]`;
}

function processCSS(css) {
  return stringify(css).replace(/%__imported_item__\d+__%/g, function (match) {
    const i = importDB.get(match);
    const parsedNamespace = i.name.reduce(createNamespaceAccessorsReducer,
      `require(${stringify(i.path)})`);

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
${exportsToJS(exports)},
${importsToJS(imports)}
);

module.exports = exports.default;`;
};
