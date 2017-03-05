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
/******/ 	return __webpack_require__(__webpack_require__.s = 147);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = require("openlayers");

/***/ }),

/***/ 147:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pick2 = __webpack_require__(23);

var _pick3 = _interopRequireDefault(_pick2);

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _ol3Tilecache = __webpack_require__(60);

var _func = __webpack_require__(17);

var _source = __webpack_require__(22);

var _source2 = _interopRequireDefault(_source);

var _vlOl = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  url: {
    type: String,
    required: true
  },
  tileSize: {
    type: Array,
    default: function _default() {
      return [_vlOl.consts.TILE_SIZE, _vlOl.consts.TILE_SIZE];
    },
    validator: function validator(value) {
      return value.length === 2;
    }
  },
  tilePixelRatio: {
    type: Number,
    default: _vlOl.consts.PIXEL_RATIO
  },
  crossOrigin: {
    type: String,
    default: 'anonymous'
  },
  cacheSize: {
    type: Number,
    default: _vlOl.consts.CACHE_SIZE
  },
  opaque: Boolean,
  minZoom: {
    type: Number,
    default: _vlOl.consts.MIN_ZOOM
  },
  maxZoom: {
    type: Number,
    default: _vlOl.consts.MAX_ZOOM
  }
};

var computed = {
  urlTokens: function urlTokens() {
    return [];
  }
};

var methods = {
  /**
   * @return {ol.tilegrid.TileGrid}
   * @protected
   */
  createTileGrid: function createTileGrid() {
    return _openlayers2.default.tilegrid.createXYZ({
      extent: _openlayers2.default.proj.get(this.projection).getExtent(),
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      tileSize: this.tileSize
    });
  },

  /**
   * @return {ol.TileUrlFunction}
   * @protected
   */
  createTileUrlFunction: function createTileUrlFunction() {
    return (0, _ol3Tilecache.createTileUrlFunction)(this.replaceUrlTokens());
  },

  /**
   * @return {string}
   * @protected
   */
  replaceUrlTokens: function replaceUrlTokens() {
    return (0, _func.replaceTokens)(this.url, (0, _pick3.default)(this.urlTokens, this));
  }
};

exports.default = {
  mixins: [_source2.default],
  props: props,
  computed: computed,
  methods: methods
};

/***/ }),

/***/ 17:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/func");

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/ol");

/***/ }),

/***/ 22:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/source");

/***/ }),

/***/ 23:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/pick");

/***/ }),

/***/ 60:
/***/ (function(module, exports) {

module.exports = require("ol3-tilecache");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map