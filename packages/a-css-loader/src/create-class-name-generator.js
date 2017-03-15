const loaderUtils = require('loader-utils');

module.exports = function createClassNameGenerator(pattern, loaderContext) {
  /* Mostly borrowed fron npm: generic-names */
  return function generate(localName, filepath, css) {
    const name = pattern.replace(/\[local\]/gi, localName);
    const loaderOptions = {
      content: `${localName}+${css}`
    };

    const genericName = loaderUtils.interpolateName(loaderContext, name, loaderOptions);

    return genericName
      .replace(new RegExp('[^a-zA-Z0-9\\-_\u00A0-\uFFFF]', 'g'), '-')
      .replace(/^((-?[0-9])|--)/, "_$1");
  };
};

