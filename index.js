const postcss = require('postcss');
const postcssScope = require('postcss-modules-scope');
const postcssExtractImports = require('postcss-modules-extract-imports');
const loaderUtils = require('loader-utils');

let importIndex = 0;
class ImportRule {
  static createImportedName (importedName, path) {
    return JSON.stringify({
      type: 'imported-item',
      index: importIndex++,
      name: importedName,
      path: path
    });
  }

  constructor(rule) {
    const match = /:import\((.+)\)/.exec(rule.selector)

    this.rule = rule;
    this.url = match[1];
  }

  imports() {
    const imports = {};
    this.rule.walkDecls(function (decl) {
      imports[decl.prop] = decl.value;
    });

    return imports;
  }
}

class ExportRule {
  constructor(rule) {
    this.rule = rule;
  }

  exports () {
    const exports = {};
    this.rule.walkDecls(function (decl) {
      exports[decl.prop] = decl.value;
    });

    return exports;
  }
}

const plugin = postcss.plugin('parser', function parserPlugin({ callback }) {
  return function (css) {
    const imports = [];
    const exports = [];
    css.walkRules(function (rule) {
      if (/:import\(.+\)/.test(rule.selector)) {
        imports.push(new ImportRule(rule));
        rule.remove()
      }


      if (rule.selector === ':export') {
        exports.push(new ExportRule(rule))
        rule.remove()
      }
    });

    callback(imports, exports);
  }
});

function detachedPromise() {
  let resolve;
  const promise = new Promise((rs /*, rj */) => {
    resolve = rs;
  });

  return [ resolve, promise ];
}

module.exports = function (source) {
  this.cacheable();
  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query);

  const [resolveSymbols, symbolsPromise] = detachedPromise();

  const processPromise = postcss([
    postcssExtractImports({
      createImportedName: ImportRule.createImportedName
    }),
    postcssScope({ }),
    plugin({ callback: (...symbols) => resolveSymbols(symbols) })
  ]).process(source, {});


  Promise.all([processPromise, symbolsPromise])
  .then(([css, [imports, exports]]) => {
    callback(null, `
      //imports
      const imports = ${JSON.stringify(imports)};

      // exports
      const exports = ${JSON.stringify(exports)};

      module.exports = {
        toString: function toString() {
          return \`${css.css}\`;
        }
      };
    `);
  })
  .catch((err) => {
    callback(err);
  })
};
