const loaderUtils = require('loader-utils');
const importDB = require('./import-db');

const stringify = JSON.stringify;

function processedExports (exportedSymbols) {
  return exportedSymbols.map((symbol) => {
    if (symbol.type === 'local') {
      return stringify(symbol.name);
    }

    if (symbol.type === 'imported-item') {
      return `[require(${stringify(symbol.path)}), ${stringify(symbol.name)}]`;
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

module.exports = function toJS (css, imports, exports, loader) {
  const safeCSSModulePath = loaderUtils.stringifyRequest(loader, require.resolve('./_css-module.js')) ;

  const processedCSS = stringify(css).replace(/%__imported_item__\d+__%/g, function (match) {
    const i = importDB.get(match);

    return `" + require(${stringify(i.path)}).locals[${stringify(i.name)}] + "`;
  });

  return `
var CSSModule = require(${safeCSSModulePath}).CSSModule;

exports.default = new CSSModule(
${processedCSS},
${exportsToJS(exports)},
${importsToJS(imports)}
);

module.exports = exports.default;`;
};
