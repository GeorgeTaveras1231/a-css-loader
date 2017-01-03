const { strip } = require('underscore.string');
const postcss = require('postcss');

const stripQuotes = (str) => strip(str, /['"]/);

exports.urlReplacer = postcss.plugin('url-replacer', ({ createImportedName }) => {
  return (css) => {
    css.walkRules((rule) => {
      rule.walkDecls((declaration) => {
        declaration.value = declaration.value.replace(/url\((['"]?)~(.+)\1\)/g, (_whole, _quote, url) => {
          const identifier = createImportedName(null, url);
          return `url(${identifier})`;
        });
      });
    });
  };
});

exports.cssModulesFinalSweeper = postcss.plugin('css-modules-final-sweeper', ({ symbolsCollector }) => {
  return (css) => {
    css.walkAtRules('import', (rule) => {
      symbolsCollector.addUrl(stripQuotes(rule.params));
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
  };
});
