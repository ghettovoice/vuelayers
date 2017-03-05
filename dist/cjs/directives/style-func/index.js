/*!
 * VueLayers
 * Vue components to work with OpenLayers
 * 
 * @package vuelayers
 * @author Vladimir Vershinin <ghettovoice@gmail.com>
 * @version 0.1.0
 * @license MIT
 * @copyright (c) 2017, Vladimir Vershinin <ghettovoice@gmail.com>
 * 
 */
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 155);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = require("openlayers");

/***/ }),

/***/ 10:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/style-target");

/***/ }),

/***/ 121:
/***/ (function(module, exports) {

module.exports = require("vue");

/***/ }),

/***/ 13:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isFunction");

/***/ }),

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _func = __webpack_require__(27);

var _func2 = _interopRequireDefault(_func);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_func2.default.install = function (Vue) {
  Vue.directive(_func2.default.name, _func2.default);
};
exports.default = _func2.default;

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/ol");

/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isFunction2 = __webpack_require__(13);

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _vue = __webpack_require__(121);

var _vue2 = _interopRequireDefault(_vue);

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _target = __webpack_require__(10);

var _vlOl = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Directive for advanced low-level dynamic styling using ol.StyleFunction.
 * Can be applied on styleable components that use styleTarget mixins
 */
exports.default = {
  name: 'style-func',
  bind: function bind(el, binding, vnode) {
    var component = vnode.componentInstance;
    var styleFunctionFactory = binding.value;

    if (!(0, _isFunction3.default)(styleFunctionFactory) || !component.styleTarget()) return;

    bindStyleFunction(styleFunctionFactory(_openlayers2.default, _vlOl.style), component);
  },
  unbind: function unbind(el, binding, vnode) {
    var component = vnode.componentInstance;
    if (component.styleTarget()) {
      component.setStyle(component.styles);
    }
  },
  update: function update(el, binding, vnode) {
    // todo rebind style function? need test
  }
};


function bindStyleFunction(styleFunc, component) {
  var defStyleFunc = (0, _target.createStyleFunc)(component);

  _vue2.default.nextTick(function () {
    component.styleTarget().setStyle(function __directiveStyleFunc(feature, resolution) {
      var styles = styleFunc(feature, resolution);

      if (styles === null || Array.isArray(styles) && styles.length) {
        return styles;
      }

      return defStyleFunc(feature, resolution);
    });
  });
}

/***/ })

/******/ });
//# sourceMappingURL=index.js.map