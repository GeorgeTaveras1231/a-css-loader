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

  exports.forEach((symbol) => {
    code += `locals[${stringify(symbol.name)}] = ${processedExports(symbol.value)};\n`;
  });

  return `var locals = {};\n${code}`;
}

function importsToJSArray(imports) {
  const requires = [];
  for (let [url] of imports.urls.entries()) {
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

exportedObject.toString = function toString() {
  var stack = [this];
  var loaded = {};
  var css = '';

  while(stack.length) {
    var head = stack.pop();

    if (loaded[head.__module__.id]) {
      continue;
    }

    head.__module__.imports.forEach(function (i) {
      !loaded[i.__module__.id] && stack.push(i);
    });

    loaded[head.__module__.id] = true;
    css = head.__module__.rawCSS + css;
  }

  return css;
};

exportedObject.default = exportedObject;
module.exports = exportedObject;`;
};
