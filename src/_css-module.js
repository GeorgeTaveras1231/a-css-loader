var hasOwnProperty = Object.prototype.hasOwnProperty;
var freeze = Object.freeze;
var stringify = JSON.stringify;

function reverseEach(array, cb, thisArg) {
  for (var i = array.length - 1; i >= 0; i-- ) {
    cb.call(thisArg || null, array[i], i);
  }
}

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

var moduleIdCounter = 0;
function CSSModule(css, locals, imports) {
  this.locals = processLocals(locals);

  Object.defineProperty(this, '__css_module__', {
    value: freeze({
      id: moduleIdCounter++,
      rawCSS: css,
      imports: freeze(imports)
    })
  });
}

CSSModule.prototype.toString = function toString() {
  var toVisit = [this];
  var visited = {};
  var css = '';

  var currentModule;
  var currentMetadata;

  function planVisit(module) { toVisit.push(module); }

  while(toVisit.length) {
    currentModule = toVisit.pop();

    if (typeof currentModule.__css_module__ === 'object') {
      currentMetadata = currentModule.__css_module__;

      if(visited[currentMetadata.id]) continue;

      reverseEach(currentMetadata.imports, planVisit);

      visited[currentMetadata.id] = true;

      css = currentMetadata.rawCSS + css;
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
