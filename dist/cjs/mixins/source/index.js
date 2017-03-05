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
/******/ 	return __webpack_require__(__webpack_require__.s = 146);
/******/ })
/************************************************************************/
/******/ ({

/***/ 146:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxSubs = __webpack_require__(4);

var _rxSubs2 = _interopRequireDefault(_rxSubs);

var _vlOl = __webpack_require__(2);

var _debug = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  attributions: String,
  url: String,
  projection: {
    type: String,
    default: _vlOl.consts.MAP_PROJECTION
  },
  wrapX: {
    type: Boolean,
    default: true
  },
  logo: String
};

var methods = {
  /**
   * @protected
   */
  initialize: function initialize() {
    /**
     * @type {ol.source.Source}
     * @protected
     */
    this.source = this.createSource();
    this.source.$vm = this;
  },

  /**
   * @return {ol.source.Source}
   * @protected
   */
  createSource: function createSource() {
    throw new Error('Not implemented method');
  },
  mountSource: function mountSource() {
    if (this.layer()) {
      this.layer().setSource(this.source);
      this.subscribeAll();
    } else if (process.env.NODE_ENV !== 'production') {
      (0, _debug.warn)("Invalid usage of source component, should have layer component among it's ancestors");
    }
  },
  unmountSource: function unmountSource() {
    this.unsubscribeAll();
    this.layer() && this.layer().setSource(undefined);
  },
  refresh: function refresh() {
    this.source && this.source.changed();
  }
};

var watch = {
  attributions: function attributions(value) {
    this.source.setAttributions(value);
  },
  projection: function projection(value) {
    // todo recreate source?
  }
};

exports.default = {
  mixins: [_rxSubs2.default],
  inject: ['layer'],
  props: props,
  methods: methods,
  watch: watch,
  provide: function provide() {
    var _this = this;

    return {
      source: function source() {
        return _this.source;
      }
    };
  },
  render: function render(h) {
    return h('i', {
      style: {
        display: 'none !important'
      }
    }, this.$slots.default);
  },
  created: function created() {
    this.initialize();
  },
  mounted: function mounted() {
    this.mountSource();
  },
  destroyed: function destroyed() {
    this.unmountSource();
    this.source = undefined;
  }
};

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/ol");

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/debug");

/***/ }),

/***/ 4:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/rx-subs");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map