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
/******/ 	return __webpack_require__(__webpack_require__.s = 156);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = require("openlayers");

/***/ }),

/***/ 1:
/***/ (function(module, exports) {

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  scopeId,
  cssModules
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  // inject cssModules
  if (cssModules) {
    var computed = Object.create(options.computed || null)
    Object.keys(cssModules).forEach(function (key) {
      var module = cssModules[key]
      computed[key] = function () { return module }
    })
    options.computed = computed
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ 156:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _icon = __webpack_require__(52);

var _icon2 = _interopRequireDefault(_icon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_icon2.default.install = function (Vue) {
  Vue.component(_icon2.default.name, _icon2.default);
};

exports.default = _icon2.default;

/***/ }),

/***/ 26:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/style-image");

/***/ }),

/***/ 52:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(95)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(82),
  /* template */
  null,
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 82:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _image = __webpack_require__(26);

var _image2 = _interopRequireDefault(_image);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  src: {
    type: String,
    required: true
  },
  size: Array,
  anchor: {
    type: Array,
    default: function _default() {
      return [0.5, 0.5];
    }
  },
  anchorOrigin: {
    type: String,
    default: 'top-left' // bottom-left, bottom-right, top-left or top-right
  },
  anchorXUnits: {
    type: String,
    default: 'fraction' // pixels, fraction
  },
  anchorYUnits: {
    type: String,
    default: 'fraction' // pixels, fraction
  },
  color: Array,
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  offset: {
    type: Array,
    default: function _default() {
      return [0, 0];
    }
  },
  offsetOrigin: {
    type: String,
    default: 'top-left' // bottom-left, bottom-right, top-left or top-right
  },
  opacity: {
    type: Number,
    default: 1
  },
  scale: {
    type: Number,
    default: 1
  },
  snapToPixel: {
    type: Boolean,
    default: true
  },
  rotateWithView: {
    type: Boolean,
    default: false
  },
  rotation: {
    type: Number,
    default: 0
  }
};

var methods = {
  /**
   * @return {ol.style.Icon}
   * @protected
   */
  createStyle: function createStyle() {
    return new _openlayers2.default.style.Icon({
      anchor: this.anchor,
      anchorOrigin: this.anchorOrigin,
      anchorXUnits: this.anchorXUnits,
      anchorYUnits: this.anchorYUnits,
      color: this.color,
      crossOrigin: this.crossOrigin,
      offset: this.offset,
      offsetOrigin: this.offsetOrigin,
      opacity: this.opacity,
      scale: this.scale,
      snapToPixel: this.snapToPixel,
      rotateWithView: this.rotateWithView,
      rotation: this.rotation,
      size: this.size,
      src: this.src
    });
  }
};
// todo other watchers
var watch = {
  src: function src() {
    this.refresh();
  },
  size: function size() {
    this.refresh();
  },
  anchor: function anchor() {
    this.refresh();
  },
  scale: function scale() {
    this.refresh();
  }
};

exports.default = {
  name: 'vl-style-icon',
  mixins: [_image2.default],
  props: props,
  methods: methods,
  watch: watch
};

/***/ }),

/***/ 95:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map