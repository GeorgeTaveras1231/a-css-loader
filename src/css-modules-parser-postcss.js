const { Imports, Exports } = require('./collectors');
const postcss = require('postcss');

function cleanImportUrl(url) {
  return url.replace(/^(['"])(.+)\1$/g, '$2');
}

exports.isSymbolsMessage = function isSymbolsMessage(message) {
  return message.plugin === 'css-modules-parser' && message.type === 'symbols';
};

exports.urlReplacer = postcss.plugin('url-replacer', ({ createImportedName }) => {
  return (css) => {
    const imports = new Set;

    css.walkRules((rule) => {
      rule.walkDecls((declaration) => {
        declaration.value = declaration.value.replace(/url\((['"]?)~(.+)\1\)/g, (_whole, _quote, url) => {
          const alias = createImportedName(null, url);

          imports.add({ alias, url });

          return `url('${alias}')`;
        });
      });
    });

    for ( let i of imports ) {
      const rule = postcss.rule({ selector: `:import(${i.url})` });
      rule.append(postcss.decl({ prop: i.alias, value: '' }));

      css.prepend(rule);
    }
  }
});

exports.cssModulesParser = postcss.plugin('css-modules-parser', () => {
  return (css, result) => {
    const imports = new Imports;
    const exports = new Exports;

    css.walkAtRules('import', (rule) => {
      imports.addUrl(cleanImportUrl(rule.params));
      rule.remove();
    });

    css.walkRules((rule) => {
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
