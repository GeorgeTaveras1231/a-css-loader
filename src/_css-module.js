var UUID = require('simply-uuid');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var stringify = JSON.stringify;

function eachClassName(module, localName, cb) {
  var importedModule;

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
        uniqueModules[importedClassName] = true
      });

      return
    }

    uniqueModules[classNameOrImport] = true;
  });

  return Object.keys(uniqueModules).join(' ');
}

function processLocals(locals) {
  var newLocals = {};
  for (var key in locals) {
    if (!hasOwnProperty.call(locals, key)) continue;

    newLocals[key] = composeLocals(locals[key]);
  }

  return newLocals;
}

function CSSModule(css, locals, imports) {
  this.locals = processLocals(locals);

  Object.defineProperty(this, '__css_module__', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: { id: UUID.generate(), rawCSS: css, imports: imports }
  });
}

CSSModule.prototype.toString = function toString() {
  var stack = [this];
  var visited = {};
  var css = '';
  var node;

  while(stack.length) {
    node = stack.pop().__css_module__;

    node.imports.forEach(function (i) {
      !visited[i.__css_module__.id] && stack.push(i);
    });

    visited[node.id] = true;
    css = node.rawCSS + css;
  }

  return css;
};

CSSModule.prototype.get = function get(key) {
  if (!this.locals[key]) {
    throw new Error('local named ' + stringify(key) + ' is not defined');
  }

  return this.locals[key];
};

exports.CSSModule = CSSModule
