const { Imports, Exports } = require('./rule-lists');
const postcss = require('postcss');

module.exports = postcss.plugin('parser', function parserPlugin({ getSymbols }) {
  return function (css) {
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

    getSymbols({ imports, exports });
  }
});
