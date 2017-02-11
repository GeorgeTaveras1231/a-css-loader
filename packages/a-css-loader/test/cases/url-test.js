const assert = require('assert');

const configFactory = require('../factories/webpack-config');
const setup = require('../support/test-setup');

const webpackConfig = configFactory({
  context: 'url-test',
  query: { mode: 'global' }
});

describe('url', () => {
  before(setup(webpackConfig));

  it('integrates urls with webpack', function () {
    const ruleWithBackground = this.parsedCSS.stylesheet.rules.find((rule) => rule.type === 'rule');
    const backgroundDeclaration = ruleWithBackground.declarations[0].value.split(' ');

    assert.equal(backgroundDeclaration[0], 'url(generated-by-webpack-2e7f69.jpg)');
  });

  it('works in @font-face\'s', function () {
    const fontFaceRule = this.parsedCSS.stylesheet.rules.find((rule) => rule.type === 'font-face');
    const backgroundDeclaration = fontFaceRule.declarations[1].value.split(' ');

    assert.equal(backgroundDeclaration[0], 'url(generated-by-webpack-38faa7.woff)');
  });

  it('works with other functions in same line', function () {
    const fontFaceRule = this.parsedCSS.stylesheet.rules.find((rule) => rule.type === 'font-face');
    const backgroundDeclaration = fontFaceRule.declarations[1].value.split(' ');

    assert.equal(backgroundDeclaration[1], 'format(woff)');
  });
});
