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
/******/ 	return __webpack_require__(__webpack_require__.s = 153);
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

/***/ 106:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('i', {
    staticStyle: {
      "display": "none !important"
    }
  }, [_vm._t("default")], 2)
},staticRenderFns: []}

/***/ }),

/***/ 153:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _container = __webpack_require__(50);

var _container2 = _interopRequireDefault(_container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_container2.default.install = function (Vue) {
  Vue.component(_container2.default.name, _container2.default);
};

exports.default = _container2.default;

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/debug");

/***/ }),

/***/ 50:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(98)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(80),
  /* template */
  __webpack_require__(106),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _debug = __webpack_require__(3);

var _style = __webpack_require__(9);

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  zIndex: Number,
  geomType: String
}; //
//
//
//
//
//

/**
 * ol.style.Style wrapper.
 * Acts as an style container that will be injected into "style" slot inside layer or feature components.
 */


var methods = {
  /**
   * @return {ol.style.Style}
   * @protected
   */
  createStyle: function createStyle() {
    return new _openlayers2.default.style.Style({
      zIndex: this.zIndex,
      fill: this.fill,
      stroke: this.stroke,
      image: this.image
    });
  },
  mountStyle: function mountStyle() {
    var currentStyle = this.getStyle() || [];
    if (!Array.isArray(currentStyle)) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _debug.warn)('Current style is not an array, will be replaced with new style array');
      }
      currentStyle = [];
    }

    currentStyle.push({
      style: this.style,
      geomType: this.geomType
    });
    this.setStyle(currentStyle);
  },
  unmountStyle: function unmountStyle() {
    var _this = this;

    var currentStyle = this.getStyle() || [];
    if (!Array.isArray(currentStyle)) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _debug.warn)('Current style is not an array, will be replaced with new style array');
      }
      currentStyle = [];
    }

    currentStyle = currentStyle.filter(function (s) {
      return s.style !== _this.style;
    });
    currentStyle.length || (currentStyle = undefined);
    this.setStyle(currentStyle);
  }
};

var watch = {
  zIndex: function zIndex(value) {
    this.style.setZIndex(value);
  },
  geomType: function geomType() {
    this.refresh();
  }
};

exports.default = {
  name: 'vl-style-container',
  mixins: [_style2.default],
  inject: ['setStyle', 'getStyle'],
  props: props,
  methods: methods,
  watch: watch,
  provide: function provide() {
    return {
      setFill: setFill.bind(this),
      setStroke: setStroke.bind(this),
      setImage: setImage.bind(this)
    };
  }
};


function setFill(fill) {
  /**
   * @type {ol.style.Fill}
   * @protected
   */
  this.fill = fill;

  if (this.style) {
    this.style.setFill(this.fill);
    this.refresh();
  }
}

function setStroke(stroke) {
  /**
   * @type {ol.style.Stroke}
   * @protected
   */
  this.stroke = stroke;

  if (this.style) {
    this.style.setStroke(this.stroke);
    this.refresh();
  }
}

function setImage(image) {
  /**
   * @type {ol.style.Image}
   * @protected
   */
  this.image = image;

  if (this.style) {
    this.style.setImage(this.image);
    this.refresh();
  }
}

/***/ }),

/***/ 9:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/style");

/***/ }),

/***/ 98:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map