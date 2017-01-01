const assert = require('assert');

module.exports = function assertIncludesClassPattern(classListString, pattern) {
  const regexp = new RegExp(pattern);
  const classList = classListString.split(' ');

  assert(classList.some(c => regexp.test(c)),
    `Expected ${JSON.stringify(classListString)} to include pattern ${JSON.stringify(pattern.toString())}`);
};

