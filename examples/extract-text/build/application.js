(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const css = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	var CSSModule = __webpack_require__(2).CSSModule;

	exports.default = new CSSModule(
	"",
	{
		"lg-font": ["10px"],
		"a": ["a--2a283"],
		"b": ["b--8718b","a--2a283",[__webpack_require__(3), "a"]],
		"c": ["c--1594e"]},
	[]
	);

	module.exports = exports.default;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var freeze = Object.freeze;
	var stringify = JSON.stringify;

	function reverseEach(array, cb) {
	  for (var i = array.length - 1; i >= 0; i-- ) {
	    cb.call(null, array[i], i);
	  }
	}

	function eachClassName(module, localName, cb) {
	  var importedModules;

	  if (typeof module.get === 'function') {
	    importedModules = module.get(localName);
	  } else if (typeof module.locals === 'object') {
	    importedModules = module.locals[localName];
	  } else {
	    importedModules = module[localName];
	  }

	  importedModules.split(' ').forEach(cb);
	}

	function composeLocals(classNamesOrImports) {
	  var uniqueModules = {};

	  if (typeof classNamesOrImports === 'string') {
	    classNamesOrImports = classNamesOrImports.split(' ');
	  }

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

	function processImports(imports) {
	  return imports.map(function (module) {
	    if (module instanceof CSSModule) {
	      return module;
	    }

	    var css = typeof module.toCssString === 'function' ? module.toCssString() : '';

	    return new CSSModule(
	      css,
	      module.locals,
	      []
	    )
	  });
	}

	var moduleIdCounter = 0;
	function CSSModule(css, locals, imports) {
	  this.locals = processLocals(locals);

	  Object.defineProperty(this, '__css_module__', {
	    value: freeze({
	      id: moduleIdCounter++,
	      rawCSS: css,
	      imports: freeze(processImports(imports))
	    })
	  });
	}

	CSSModule.prototype.toString = function toString() {
	  var toVisit = [this];
	  var visited = {};
	  var css = '';

	  var currentModule;

	  function planVisit(module) { toVisit.push(module); }

	  while (toVisit.length) {
	    currentModule = toVisit.pop().__css_module__;

	    if (visited[currentModule.id]) continue;

	    reverseEach(currentModule.imports, planVisit);

	    visited[currentModule.id] = true;

	    css = currentModule.rawCSS + css;
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	var CSSModule = __webpack_require__(2).CSSModule;

	exports.default = new CSSModule(
	"",
	{
		"a": ["a--d398d"]},
	[]
	);

	module.exports = exports.default;

/***/ }
/******/ ])
});
;