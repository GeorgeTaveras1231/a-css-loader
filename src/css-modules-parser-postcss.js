const { Imports, Exports } = require('./rule-lists');
const postcss = require('postcss');

exports.isSymbolsMessage = function isSymbolsMessage(message) {
  return message.plugin === 'css-modules-parser' && message.type === 'symbols';
};

exports.cssModulesParser = postcss.plugin('css-modules-parser', function parserPlugin() {
  return function (css, result) {
    const imports = new Imports;
    const exports = new Exports;

    css.walkRules(function (rule) {
      if (/:import\(.+\)/.test(rule.selector)) {
        imports.add(rule);
        rule.remove();
      }


      if (rule.selector === ':export') {
        exports.add(rule);
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
