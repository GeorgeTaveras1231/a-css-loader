const loaderUtils = require('loader-utils');
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
  const safeCSSModulePath = loaderUtils.stringifyRequest(this, require.resolve('./_css-module.js')) ;
  return `
var CSSModule = require(${safeCSSModulePath}).CSSModule;

exports.default = new CSSModule(
${stringify(css)},
${exportsToJS(exports)},
${importsToJS(imports)}
);

module.exports = exports.default;`;
};
