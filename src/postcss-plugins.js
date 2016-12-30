const postcss = require('postcss');

function cleanImportUrl(url) {
  return url.replace(/^(['"])(.+)\1$/g, '$2');
}

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

exports.cssModulesFinalSweeper = postcss.plugin('css-modules-final-sweeper', ({ symbolsCollector }) => {
  return (css) => {
    css.walkAtRules('import', (rule) => {
      symbolsCollector.addUrl(cleanImportUrl(rule.params));
      rule.remove();
    });

    css.walkRules((rule) => {
      if (/:import\(.+\)/.test(rule.selector)) {
        rule.remove();
      }

      if (rule.selector === ':export') {
        rule.walkDecls((declaration) => {
           symbolsCollector.addExportItem({ name: declaration.prop, values: declaration.value });
        });

        rule.remove();
      }
    });
  }
});
