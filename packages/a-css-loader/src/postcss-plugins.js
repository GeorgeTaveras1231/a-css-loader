const { strip } = require('underscore.string');
const postcss = require('postcss');

const stripQuotes = (str) => strip(str, /['"]/);

function replaceUrls(rule, createImportedName) {
  rule.walkDecls((declaration) => {
    declaration.value = declaration.value.replace(/url\((['"]?)~([^\)]+)\1\)/g, (_whole, _quote, url) => {
      const identifier = createImportedName(null, url);
      return `url(${identifier})`;
    });
  });
}

exports.urlReplacer = postcss.plugin('url-replacer', ({ createImportedName }) => {
  return (css) => {
    css.walkAtRules('font-face', rule => replaceUrls(rule, createImportedName));
    css.walkRules(rule => replaceUrls(rule, createImportedName));
  };
});


function addUrl(rule, symbolsCollector) {
  symbolsCollector.addUrl(stripQuotes(rule.params));
  rule.remove();
}

exports.cssModulesFinalSweeper = postcss.plugin('css-modules-final-sweeper', ({ symbolsCollector }) => {
  return (css) => {
    css.walkAtRules('import', (rule) => {
      addUrl(rule, symbolsCollector)
    });

    css.walkAtRules('require', (rule) => {
      addUrl(rule, symbolsCollector)
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
