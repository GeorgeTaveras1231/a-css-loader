var hasOwnProperty = Object.prototype.hasOwnProperty;
var freeze = Object.freeze;
var stringify = JSON.stringify;

var CSSModulePrototype = Object.create(Array.prototype, {
  get: {
    value: function (name) {
      return getLocal(this.locals, name);
    }
  },
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

function eachClassName(module, localName, cb) {
  var importedModules;

  if (typeof module.locals === 'object') {
    importedModules = getLocal(module.locals, localName);
  } else {
    importedModules = getLocal(module, localName);
  }

  (importedModules || '').split(' ').forEach(cb);
}

function composeLocals(classNamesOrImports) {
  var uniqueClassNames = {};

  if (typeof classNamesOrImports === 'string') {
    classNamesOrImports = classNamesOrImports.split(' ');
  }

  classNamesOrImports.forEach(function (classNameOrImport) {
    /* Its an import if its an array */
    if (Array.isArray(classNameOrImport)) {
      eachClassName(classNameOrImport[0], classNameOrImport[1], function (importedClassName) {
        uniqueClassNames[importedClassName] = true;
      });

      return;
    }

    uniqueClassNames[classNameOrImport] = true;
  });

  return Object.keys(uniqueClassNames).join(' ');
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

var nonCSSModuleImportId = 0;
function processImports(parentModule, imports) {
  return imports.map(function (module) {
    if (module.__is_css_module__) {
      return module;
    }

    var css = typeof module.toCssString === 'function' ? module.toCssString() : '';

    return cssModuleBuilder(
      parentModule.id + '/import__' + nonCSSModuleImportId++,
      css,
      module.locals,
      []
    )
  });
}

function cssModuleBuilder(moduleId, css, locals, imports) {
  var module = [];

  /* Change the prototype of array to add method overrides that are not 'own keys' */
  /* This is kinda strange I know. I tried making a separate constructor that inherits from
   * The Array.prototype but the ExtractTextPlugin depends on the modules being native arrays.
   **/
  module.__proto__ = CSSModulePrototype;

  module.push([
    moduleId,
    css,
    null
  ]);

  processImports(module, imports).forEach(function (i) {
    module.push.apply(module, i);
  });

  module.locals = processLocals(locals);

  return module;
}


function getLocal(module, key) {
  if (!module[key]) {
    throw new Error('local named ' + stringify(key) + ' is not defined in \n' + stringify(module, null, 2));
  }

  return module[key];
};

exports.cssModuleBuilder = cssModuleBuilder;
