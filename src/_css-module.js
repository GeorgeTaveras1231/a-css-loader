'use strict';
var forEach = Array.prototype.forEach;
var push = Array.prototype.push;

var hasOwnProperty = Object.prototype.hasOwnProperty;
var stringify = JSON.stringify;

/* Shared counter to guarantee unique ids for nonCSSModule imports */
var nonCSSModuleImportId = 0;

var CSSModulePrototype = Object.create(Array.prototype, {
  toString: {
    value: function toString() {
      var visited = {};
      var css = '';

      reverseEach(this, function (module) {
        var id = module[0];
        var newCSS = module[1];

        if (visited[id]) return;

        visited[id] = true;

        css += newCSS;
      })

      return css;
    }
  },
  require: {
    value: function require(cssModule) {
      var css;
      var moduleToImport;

      if (cssModule.__is_css_module__) {
        moduleToImport = cssModule
      } else {
        css = typeof cssModule.toCssString === 'function' ? cssModule.toCssString() : '';

        moduleToImport = [
          [
            this.id + '/import__' + nonCSSModuleImportId++,
            css,
            null
          ]
        ];
      }

      push.apply(this, moduleToImport);
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


function reverseEach(array, cb) {
  for (var i = array.length - 1; i >= 0; i-- ) {
    cb.call(null, array[i], i);
  }
}

function eachLocalValue(module, localName, processValue) {
  var values;

  if (typeof module.locals === 'object') {
    values = module.locals[localName];
  } else {
    values = module[localName];
  }

  (values || '').split(' ').forEach(processValue)
}

function composeLocals(localValues) {
  var uniqueValues = {};

  if (typeof localValues === 'string') {
    localValues = localValues.split(/\s*/);
  }

  forEach.call(localValues, function (valueOrImport) {
    /* Its an import if its an array */
    if (Array.isArray(valueOrImport)) {
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
  module.__proto__ = CSSModulePrototype;

  push.call(module, [ moduleId, css, null ]);

  return module;
}

exports.initialize = initialize;
