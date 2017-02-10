const assert = require('assert');
const builder = require('../');

describe('builder', () => {
  describe('.locals', () => {
    it('returns the defined locals', () => {
      const mod = builder.initialize('abc', '');
      mod.defineLocals([
        [
          ['a'],
          ['b']
        ]
      ]);

      assert.equal(mod.a, 'b');
      assert.equal(mod.locals.a, 'b');
      assert.equal(mod.locals[0], undefined);
      assert.equal(mod.locals.forEach, undefined);
    });
  });

  describe('.defineLocals', () => {
    it('defines css variables', () => {
      const mod = builder.initialize('abc', '');
      mod.defineLocals([
        [
          ['a', 'A', 'AnotherVariation'],
          ['b']
        ]
      ]);

      assert.equal(mod.a, 'b');
      assert.equal(mod.A, 'b');
      assert.equal(mod.AnotherVariation, 'b');
    });
  });

  describe('.get', () => {
    it('gets a variable', () => {
      const mod = builder.initialize('abc', '');
      mod.defineLocals([
        [
          ['a'],
          ['b']
        ]
      ]);

      assert.equal(mod.get('a'), 'b');

      try {
        mod.get('unknonwn');
      } catch(e) {
        assert(/is not defined/.test(e.message));
      }
    });
  });

  describe('.getLocal', () => {
    it('gets a variable', () => {
      const otherMod = [];
      otherMod.a = 'test';

      const result1 = builder.getLocal(otherMod, 'a');
      const result2 = builder.getLocal(otherMod, 'forEach');
      const result3 = builder.getLocal({locals: {}}, 'unknonwn');

      assert.equal(result1, 'test');
      assert.equal(result2, '');
      assert.equal(result3, '');
    });
  });
});
