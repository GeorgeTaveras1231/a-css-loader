const { Imports, Exports } = require('./rule-lists');
const postcss = require('postcss');

function cleanImportUrl(url) {
  return url.replace(/^(['"])(.+)\1$/g, '$2');
}

exports.isSymbolsMessage = function isSymbolsMessage(message) {
  return message.plugin === 'css-modules-parser' && message.type === 'symbols';
};

exports.urlReplacer = postcss.plugin('url-replacer', function ({ createImportedName }) {
  return function (css) {
    const imports = new Set;

    css.walkRules(function (rule) {

      rule.walkDecls(function (declaration) {
        declaration.value = declaration.value.replace(/url\((['"]?)~(.+)\1\)/g, function (_, quote, url) {
          const alias = createImportedName(null, url);

          imports.add({ alias, url, importedKey: 'default' });

          return `url('${alias}')`;
        });
      });
    });

    for ( let i of imports ) {
      const rule = postcss.rule({ selector: `:import(${i.url})` });
      rule.append(postcss.decl({ prop: i.alias, value: i.importedKey }));

      css.prepend(rule);
    }
  }
});

exports.cssModulesParser = postcss.plugin('css-modules-parser', function parserPlugin() {
  return function (css, result) {
    const imports = new Imports;
    const exports = new Exports;

    css.walkAtRules('import', function (rule) {
      imports.addUrl(cleanImportUrl(rule.params));
      rule.remove();
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
