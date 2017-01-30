'use strict';

/**
 * This is a factory that creates a css modules that are:
 * 1. compatible with webpack's extract-text-webpack-plugin
 * 2. compatible with webpack's style-loader
 * 3. maintains the same interface when used outside of webpack.
 *
 * Because I tried to aim for these 3 things, there are a few questionable decisions that I've made
 * (from the perspective of writing clean code).
 *
 * Gist:
 *   The resulting module is an array of arrays, (the null can probably be removed, was just added because
 *   this is how webpack-contrib/css-loader represents css-modules):
 *
 *      [ [module-id, css, null] ]
 *
 *  This array also has all of the variables defined in the css (be it, unique class mappings or
 *  @value definitions) attached at the top level. This means that everything is in the same level.
 *
 *      var module = builder.initialize(/* ommited *\/)
 *      module[0] // => entrypoint module (represented as an array)
 *      module.localVar // => local value
 *      module.locals.localVar // => local value
 *
 *  This is not ideal because it makes for a really messy module.
 *
 */

var stringify = JSON.stringify;
var isArray = Array.isArray;
var forEach = Array.prototype.forEach;
var reduce = Array.prototype.reduce;
var push = Array.prototype.push;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var CSSModuleStaticProperties = {
  __is_css_module__: { value: true },
  defineLocals: { value: defineLocals },
  get: { value: strictGetLocal },
  importEach: { value: importEach },
  locals: { get: createLocals },
  toString: { value: toString }
};

exports.initialize = function initialize(moduleId, css) {
  var module = [[ moduleId, css, null ]];

  Object.defineProperties(module, CSSModuleStaticProperties);
  Object.defineProperties(module, {
    __imported_modules__: { value: {} }
  });

  return module;
};

exports.getLocal = getLocal;

function getLocal(module, localName) {
  if (typeof module.locals === 'object') {
    return module.locals[localName];
  }

  if (module[localName] && isALocalDefinition(module, localName)) {
    return module[localName];
  }

  return '';
}

/**
 * Ensures it is an enumerable property that is not an array element
 */
function isALocalDefinition(module, local) {
  return isEnumerable.call(module, local) && !/^\d+$/.test(local)
}

function createLocals() {
  var locals = {};

  for (var local in this) {
    if (isALocalDefinition(this, local))
      locals[local] = this[local];
  }

  return locals;
}

/* Shared counter to guarantee unique ids for nonCSSModule imports */
var nonCSSModuleImportId = 0;
function normalizeImport(parentModule, requiredModule) {
  var css, id;

  if (requiredModule.__is_css_module__) {
    return requiredModule;
  }

  if (typeof requiredModule.toCssString === 'function') {
    id = getId(parentModule) + '/import__' + nonCSSModuleImportId++;
    css = requiredModule.toCssString();

    return [ [ id, css, null ] ];
  }

  return [ ];
}

function eachLocalValue(module, localName, processValue) {
  getLocal(module, localName).split(/\s+/).forEach(processValue);
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
  forEach.call(normalizeImport(this, cssModule), function (subModule) {
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
    this[key] = value;

  }, this);
}

function strictGetLocal(localName) {
  var local = getLocal(this, localName);

  if (local) {
    return local;
  } else {
    throw new Error(stringify(localName) + ' is not defined in ' + stringify(this.locals, null, 2));
  }
}

function getId(module) {
  return module[0][0];
}
