const postcss = require('postcss');
const postcssModules = require('postcss-modules')

function getJSON () {
  let resolve, reject;
  const promise = new Promise((rs, rj) => {
    [resolve, reject] = [rs, rj];
  });

  return [promise, function (fileName, json) {
    resolve(json);
  }]
}

module.exports = function (source) {
  const callback = this.async();
  const [getJSONPromise, getJSONCallback] = getJSON();

  const processPromise = postcss([
    postcssModules({
      scopedBehavior: 'global',
      getJSON: getJSONCallback
    })
  ]).process(source, {})

  this.cacheable();

  Promise.all([processPromise, getJSONPromise])
  .then(([css, json]) => {
    callback(null, `
      module.export = {
        toString: function toString() {
          return ${JSON.stringify(css.css)};
        },
        locals: ${JSON.stringify(json)}
      };
    `);
  })
  .catch((err) => {
    callback(err);
  })
};
