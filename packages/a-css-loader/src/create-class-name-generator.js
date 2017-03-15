const loaderUtils = require('loader-utils');

module.exports = function createClassNameGenerator(pattern, loaderContext) {
  /* Mostly borrowed fron npm: generic-names */
  return function generate(localName, filepath, css) {
    var name = pattern.replace(/\[local\]/gi, localName);
    var loaderOptions = {
      content: `${localName}+${css}`
    };

    var genericName = loaderUtils.interpolateName(loaderContext, name, loaderOptions);

    return genericName
      .replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-')
      .replace(/^((-?[0-9])|--)/, "_$1");
  };
};

