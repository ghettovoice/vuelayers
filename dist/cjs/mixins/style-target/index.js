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
/******/ 	return __webpack_require__(__webpack_require__.s = 160);
/******/ })
/************************************************************************/
/******/ ({

/***/ 13:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isFunction");

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kebabCase2 = __webpack_require__(58);

var _kebabCase3 = _interopRequireDefault(_kebabCase2);

var _isFunction2 = __webpack_require__(13);

var _isFunction3 = _interopRequireDefault(_isFunction2);

exports.createStyleFunc = createStyleFunc;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  provide: function provide() {
    return {
      setStyle: this.setStyle.bind(this),
      getStyle: this.getStyle.bind(this)
    };
  },
  beforeCreate: function beforeCreate() {
    this.styles = [];
  },

  methods: {
    styleTarget: function styleTarget() {},
    setStyle: function setStyle(style) {
      this.styles = style;
      var styleTarget = this.styleTarget();

      if (styleTarget) {
        if (this.styles && this.styles.length) {
          styleTarget.setStyle((0, _isFunction3.default)(this.styles) ? this.styles : createStyleFunc(this));
        } else {
          styleTarget.setStyle(undefined);
        }
        this.refresh();
      }
    },
    getStyle: function getStyle() {
      return this.styles || [];
    }
  }
};
// todo implement removed, aka null style

function createStyleFunc(styleTarget) {
  return function __styleTargetStyleFunc(feature, resolution) {
    if (!styleTarget.styles || !styleTarget.styles.length) return null;

    var plainFeature = feature.$vm ? feature.$vm.plain() : feature.getProperties();
    if (!plainFeature.geometry) return null;

    var styles = [];
    styleTarget.styles.forEach(function (_ref) {
      var style = _ref.style,
          geomType = _ref.geomType;

      if (geomType == null || plainFeature.geometry.type === geomType || (0, _kebabCase3.default)(feature.geometry.type) === geomType) {
        styles.push(style);
      }
    });

    return styles;
  };
}

/***/ }),

/***/ 58:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/kebabCase");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map