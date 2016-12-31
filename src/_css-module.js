'use strict';
var stringify = JSON.stringify;
var isArray = Array.isArray;
var forEach = Array.prototype.forEach;
var reduce = Array.prototype.reduce;
var push = Array.prototype.push;

var CSSModuleStaticProperties = {
  toString: { value: toString },
  importEach: { value: importEach },
  defineLocals: { value: defineLocals },
  get: { value: getLocal },
  id: { get: getId },
  __is_css_module__: { value: true }
};

exports.initialize = function initialize(moduleId, css) {
  var module = [];

  Object.defineProperties(module, CSSModuleStaticProperties);
  Object.defineProperties(module, {
    locals: { value: {} },
    __imported_modules__: { value: {} }
  });

  module.push([ moduleId, css, null ]);

  return module;
};
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


function toString() {
  return reduce.call(this, function (cssString, subModule) {
    return subModule[1] + cssString;
  }, '');
}

function importModule(cssModule) {
  forEach.call(normalizeRequire(this, cssModule), function (subModule) {
    var id = subModule[0];

    if (!this.__imported_modules__[id]) {
      this.__imported_modules__[id] = true;

      push.call(this, subModule);
    }
  }, this);
}

function importEach(cssModuleList) {
  forEach.call(cssModuleList, importModule, this);
}

function defineLocals(localDefinitions) {
  eachLocalKV(localDefinitions, function (key, value) {
    this.locals[key] = value;
  }, this);
}

function getLocal(local) {
  if (this.locals[local] === undefined) {
    throw new Error(stringify(local) + ' is not defined in ' + stringify(this.locals, null, 2));
  }

  return this.locals[local];
}

function getId() {
  return this[0][0];
}
