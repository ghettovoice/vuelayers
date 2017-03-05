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
/******/ 	return __webpack_require__(__webpack_require__.s = 158);
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

/***/ 104:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 158:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stroke = __webpack_require__(53);

var _stroke2 = _interopRequireDefault(_stroke);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_stroke2.default.install = function (Vue) {
  Vue.component(_stroke2.default.name, _stroke2.default);
};

exports.default = _stroke2.default;

/***/ }),

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(104)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(83),
  /* template */
  null,
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _style = __webpack_require__(9);

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  color: {
    type: [Array, String],
    default: null
  },
  lineCap: {
    type: String,
    default: 'round' // round, butt, square
  },
  lineJoin: {
    type: String,
    default: 'round' // round, bevel, miter
  },
  lineDash: Array,
  lineDashOffset: Number,
  miterLimit: Number,
  width: {
    type: Number,
    default: 1
  }
};

var methods = {
  /**
   * @return {ol.style.Stroke}
   * @protected
   */
  createStyle: function createStyle() {
    return new _openlayers2.default.style.Stroke({
      color: this.color,
      lineCap: this.lineCap,
      lineJoin: this.lineJoin,
      lineDash: this.lineDash,
      lineDashOffset: this.lineDashOffset,
      miterLimit: this.miterLimit,
      width: this.width
    });
  },

  /**
   * @protected
   */
  mountStyle: function mountStyle() {
    this.setStroke(this.style);
  },

  /**
   * @protected
   */
  unmountStyle: function unmountStyle() {
    this.setStroke(undefined);
  }
};

var watch = {
  color: function color(value) {
    this.style.setColor(value);
    this.refresh();
  },
  lineCap: function lineCap(value) {
    this.style.setLineCap(value);
    this.refresh();
  },
  lineDash: function lineDash(value) {
    this.style.setLineDash(value);
    this.refresh();
  },
  lineJoin: function lineJoin(value) {
    this.style.setLineJoin(value);
    this.refresh();
  },
  width: function width(value) {
    this.style.setWidth(value);
    this.refresh();
  }
  // todo добавить остальный вотчеры

};

exports.default = {
  name: 'vl-style-stroke',
  mixins: [_style2.default],
  inject: ['setStroke'],
  props: props,
  watch: watch,
  methods: methods
};

/***/ }),

/***/ 9:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/style");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map