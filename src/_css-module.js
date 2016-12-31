'use strict';
var stringify = JSON.stringify;
var isArray = Array.isArray;
var forEach = Array.prototype.forEach;
var reduce = Array.prototype.reduce;
var push = Array.prototype.push;

var CSSModulePrototype = Object.create(Array.prototype, {
  toString: {
    value: function toString() {
      return reduce.call(this, function (cssString, subModule) {
        return subModule[1] + cssString;
      }, '');
    }
  },
  require: {
    value: function require(cssModule) {
      forEach.call(normalizeRequire(this, cssModule), function (subModule) {
        var id = subModule[0];

        if (!this.__already_required__[id]) {
          this.__already_required__[id] = true;

          push.call(this, subModule);
        }
      }, this);
    }
  },
  requireAll: {
    value: function requireAll(cssModuleList) {
      forEach.call(cssModuleList, this.require, this);
    }
  },
  defineLocals: {
    value: function defineLocals(localDefinitions) {
      eachLocalKV(localDefinitions, function (key, value) {
        this.locals[key] = value;
      }, this);
    }
  },
  get: {
    value: function get(local) {
      if (this.locals[local] === undefined) {
        throw new Error(stringify(local) + ' is not defined in ' + stringify(this.locals, null, 2));
      }

      return this.locals[local];
    }
  },
  id: {
    get: function() {
      return this[0][0];
    }
  },
  __is_css_module__: { value: true }
});

function CSSModule() {}
CSSModule.prototype = CSSModulePrototype;

/* Shared counter to guarantee unique ids for nonCSSModule imports */
var nonCSSModuleImportId = 0;
function normalizeRequire(parentModule, requiredModule) {
  var css, id;

  if (requiredModule.__is_css_module__) {
    return requiredModule;
  }

  if (typeof requiredModule.toCssString === 'function') {
    id = parentModule.id + '/import__' + nonCSSModuleImportId++;
    css = requiredModule.toCssString();

    return [ [ id, css, null ] ];
  }

  return [ ];
}

function eachLocalValue(module, localName, processValue) {
  var values;

  if (typeof module.locals === 'object') {
    values = module.locals[localName];
  } else {
    values = module[localName];
  }

  (values || '').split(/\s+/).forEach(processValue);
}

function composeLocals(localValues) {
  var uniqueValues = {};

  forEach.call(localValues, function (valueOrImport) {
    /* Its an import if its an array */
    if (isArray(valueOrImport)) {
      eachLocalValue(valueOrImport[0], valueOrImport[1], function (importedValue) {
        uniqueValues[importedValue] = true;
      });

      return;
    }

    uniqueValues[valueOrImport] = true;
  });

  return Object.keys(uniqueValues).join(' ');
}

function eachLocalKV(localDefinitions, processLocalDefinition, thisArg) {
  forEach.call(localDefinitions, function (localDefinition) {
    var keys = localDefinition[0];
    var values = localDefinition[1];

    forEach.call(keys, function (key) {
      processLocalDefinition.call(thisArg, key, composeLocals(values));
    });
  });
}

function initialize(moduleId, css) {
  var module = [];
  module.locals = {};

  /* Change the prototype of array to add method overrides that are not 'own keys' */
  /* This is kinda strange I know. I tried making a separate constructor that inherits from
   * The Array.prototype but the ExtractTextPlugin depends on the modules being native arrays.
   **/
  Object.setPrototypeOf(module, CSSModulePrototype);

  /* lookup table to ensure modules are required once */
  Object.defineProperty(module, '__already_required__', { value: {} });

  push.call(module, [ moduleId, css, null ]);

  return module;
}

exports.initialize = initialize;
