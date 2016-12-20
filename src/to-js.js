const uuid = require('node-uuid');
const stringify = JSON.stringify;

function processedExports (exportedSymbols) {
  return exportedSymbols.map((symbol) => {
    if (symbol.type === 'local') {
      return stringify(symbol.name);
    }

    if (symbol.type === 'imported-item') {
      return `require(${stringify(symbol.path)}).locals[${stringify(symbol.name)}]`;
    }
  }).join(' + " " + ');
}

function exportsToJS(exports) {
  let code = '';

  for (let symbol of exports) {
    code += `locals[${stringify(symbol.name)}] = ${processedExports(symbol.value)};\n`;
  }

  return `var locals = {};\n${code}`;
}

function importsToJSArray(imports) {
  const requires = [];
  for (let url of imports) {
    requires.push(`require(${stringify(url)})`);
  }

  return `[${requires.join(',')}]`;
}

function importsToCode(imports) {
  return `var imports = ${importsToJSArray(imports)};`
}

module.exports = function (css, imports, exports) {
  const moduleMeta = {
    id: uuid.v4(),
    rawCSS: css
  };

  return `
${exportsToJS(exports)}
${importsToCode(imports)}
var exportedObject = {};
exportedObject.locals = locals;
exportedObject.__module__ = ${stringify(moduleMeta)};
exportedObject.__module__.imports = imports;

exportedObject.toString = require(${stringify(require.resolve('./_module.js'))}).toStringBuilder();

exportedObject.default = exportedObject;
module.exports = exportedObject;`;
};
