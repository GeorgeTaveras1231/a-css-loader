var UUID = require('simply-uuid');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var freeze = Object.freeze;
var stringify = JSON.stringify;

function eachClassName(module, localName, cb) {
  var importedModules;

  if (typeof module.get === 'function') {
    importedModules = module.get(localName);
  } else {
    importedModules = module.locals[localName];
  }

  importedModules.split(' ').forEach(cb);
}

function composeLocals(classNamesOrImports) {
  var uniqueModules = {};

  classNamesOrImports.forEach(function (classNameOrImport) {
    /* Its an import if its an array */
    if (Array.isArray(classNameOrImport)) {
      eachClassName(classNameOrImport[0], classNameOrImport[1], function (importedClassName) {
        uniqueModules[importedClassName] = true;
      });

      return;
    }

    uniqueModules[classNameOrImport] = true;
  });

  return Object.keys(uniqueModules).join(' ');
}

function processLocals(locals) {
  var newLocals = {};
  var key;

  for (key in locals) {
    if (hasOwnProperty.call(locals, key)) {
      newLocals[key] = composeLocals(locals[key]);
    }
  }

  return newLocals;
}

function CSSModule(css, locals, imports) {
  this.locals = processLocals(locals);

  Object.defineProperty(this, '__css_module__', {
    value: freeze({
      id: UUID.generate(),
      rawCSS: css,
      imports: freeze(imports)
    })
  });
}

CSSModule.prototype.toString = function toString() {
  var stack = [this];
  var visited = {};
  var css = '';
  var module;
  var node;

  function addNodeToStack(module) {
    stack.push(module);
  }

  while(stack.length) {
    module = stack.pop();

    if (typeof module.__css_module__ === 'object') {
      node = module.__css_module__;

      node.imports.forEach(addNodeToStack);

      visited[node.id] = true;
      css = node.rawCSS + css;
    } else {
      css = module.toString() + css;
    }
  }

  return css;
};

CSSModule.prototype.get = function get(key) {
  if (!this.locals[key]) {
    throw new Error('local named ' + stringify(key) + ' is not defined');
  }

  return this.locals[key];
};

exports.CSSModule = CSSModule;
