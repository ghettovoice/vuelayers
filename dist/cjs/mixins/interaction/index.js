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
/******/ 	return __webpack_require__(__webpack_require__.s = 135);
/******/ })
/************************************************************************/
/******/ ({

/***/ 135:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxSubs = __webpack_require__(4);

var _rxSubs2 = _interopRequireDefault(_rxSubs);

var _debug = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {};

var methods = {
  /**
   * @protected
   */
  initialize: function initialize() {
    /**
     * @type {ol.interaction.Interaction}
     * @protected
     */
    this.interaction = this.createInteraction();
    this.interaction.$vm = this;
  },

  /**
   * @return {ol.interaction.Interaction}
   * @protected
   */
  createInteraction: function createInteraction() {
    throw new Error('Not implemented method');
  },

  /**
   * @protected
   */
  mountInteraction: function mountInteraction() {
    if (this.map()) {
      this.map() && this.map().addInteraction(this.interaction);
      this.subscribeAll();
    } else if (process.env.NODE_ENV !== 'production') {
      (0, _debug.warn)("Invalid usage of interaction component, should have map component among it's ancestors");
    }
  },

  /**
   * @protected
   */
  unmountInteraction: function unmountInteraction() {
    this.unsubscribeAll();
    this.map() && this.map().removeInteraction(this.interaction);
  },
  refresh: function refresh() {
    this.interaction && this.interaction.changed();
  }
};

exports.default = {
  mixins: [_rxSubs2.default],
  inject: ['map'],
  props: props,
  methods: methods,
  provide: function provide() {
    var _this = this;

    return {
      interaction: function interaction() {
        return _this.interaction;
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
    this.mountInteraction();
  },
  destroyed: function destroyed() {
    this.unmountInteraction();
    this.interaction = undefined;
  }
};

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