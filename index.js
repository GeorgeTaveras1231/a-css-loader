const postcss = require('postcss');
const postcssScope = require('postcss-modules-scope');
const postcssExtractImports = require('postcss-modules-extract-imports');
const loaderUtils = require('loader-utils');

const createImportedName = require('./src/create-imported-name');
const parserPlugin = require('./src/postcss-parser-plugin');
const toJS = require('./src/to-js');


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
    postcssExtractImports({ createImportedName }),
    postcssScope(),
    parserPlugin({ getSymbols: resolveSymbols })
  ]).process(source);


  Promise.all([processPromise, symbolsPromise])
  .then(([css, {imports, exports}]) => {
    callback(null, toJS(css.css, imports, exports));
  })
  .catch((err) => {
    callback(err);
  })
};
