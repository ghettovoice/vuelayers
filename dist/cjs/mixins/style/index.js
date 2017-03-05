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
/******/ 	return __webpack_require__(__webpack_require__.s = 159);
/******/ })
/************************************************************************/
/******/ ({

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Basic style mixin.
 * Exposes for children inner OpenLayer style object as styleTarget.
 * Injects styleTarget from parent to apply self style.
 */

var methods = {
  /**
   * @protected
   */
  initialize: function initialize() {
    /**
     * @type {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
     * @protected
     */
    this.style = this.createStyle();
    this.style.$vm = this;
  },

  /**
   * @return {ol.style.Style|ol.style.Image|ol.style.Fill|ol.style.Stroke|ol.style.Text}
   * @protected
   */
  createStyle: function createStyle() {
    throw new Error('Not implemented method');
  },

  /**
   * @protected
   */
  mountStyle: function mountStyle() {
    throw new Error('Not implemented method');
  },

  /**
   * @protected
   */
  unmountStyle: function unmountStyle() {
    throw new Error('Not implemented method');
  },
  refresh: function refresh() {
    this.$nextTick(this.mountStyle);
  }
};

exports.default = {
  methods: methods,
  render: function render(h) {
    return h();
  },
  mounted: function mounted() {
    // Create style in  mounted hook because of some ol style classes doesn't have
    // setters for all inner objects. This setters are emulated through method: getStyleTarget
    this.initialize();
    this.mountStyle();
  },
  destroyed: function destroyed() {
    this.unmountStyle();
    this.style = undefined;
  }
};

/***/ })

/******/ });
//# sourceMappingURL=index.js.map