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

      this.push.apply(this, moduleToImport);
    }
  },
  requireAll: {
    value: function requireAll(cssModuleList) {
      Array.prototype.forEach.call(cssModuleList, this.require, this);
    }
  },
  defineLocals: {
    value: function defineLocals(localDefinitions) {
      normalizeLocals(localDefinitions, function (key, value) {
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

function eachLocal(module, localName, cb) {
  var locals;

  if (typeof module.locals === 'object') {
    locals = module.locals[localName];
  } else {
    locals = module[localName];
  }

  (locals || '').split(' ').forEach(cb);
}

function composeLocals(localValues) {
  var uniqueValues = {};

  if (typeof localValues === 'string') {
    localValues = localValues.split(/\s*/);
  }

  localValues.forEach(function (valueOrImport) {
    /* Its an import if its an array */
    if (Array.isArray(valueOrImport)) {
      eachLocal(valueOrImport[0], valueOrImport[1], function (importedValue) {
        uniqueValues[importedValue] = true;
      });

      return;
    }

    uniqueValues[valueOrImport] = true;
  });

  return Object.keys(uniqueValues).join(' ');
}

function normalizeLocals(locals, processLocalDefinition, thisArg) {
  var key;

  for (key in locals) {
    if (hasOwnProperty.call(locals, key)) {
      processLocalDefinition.call(thisArg, key, composeLocals(locals[key]));
    }
  }
}

function initialize(moduleId, css) {
  var module = [];
  module.locals = {};
  /* Change the prototype of array to add method overrides that are not 'own keys' */
  /* This is kinda strange I know. I tried making a separate constructor that inherits from
   * The Array.prototype but the ExtractTextPlugin depends on the modules being native arrays.
   **/
  module.__proto__ = CSSModulePrototype;

  module.push([ moduleId, css, null ]);

  return module;
}

exports.initialize = initialize;
