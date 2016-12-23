const { Imports, Exports } = require('./rule-lists');
const postcss = require('postcss');

function cleanImportUrl(url) {
  return url.replace(/^(['"])(.+)\1$/g, '$2');
}

exports.isSymbolsMessage = function isSymbolsMessage(message) {
  return message.plugin === 'css-modules-parser' && message.type === 'symbols';
};

exports.cssModulesParser = postcss.plugin('css-modules-parser', function parserPlugin() {
  return function (css, result) {
    const imports = new Imports;
    const exports = new Exports;

    css.walkAtRules(function (rule) {
      if (rule.name === 'import') {
        imports.addUrl(cleanImportUrl(rule.params));
        rule.remove();
      }
    });

    css.walkRules(function (rule) {
      if (/:import\(.+\)/.test(rule.selector)) {
        imports.addFromImportedSymbols(rule);
        rule.remove();
      }


      if (rule.selector === ':export') {
        exports.addFromExportedSymbols(rule);
        rule.remove();
      }
    });

    result.messages.push({
      type: 'symbols',
      plugin: 'css-modules-parser',
      imports: imports,
      exports: exports
    });
  }
});
