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
/******/ 	return __webpack_require__(__webpack_require__.s = 163);
/******/ })
/************************************************************************/
/******/ ({

/***/ 120:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/observable/fromEventPattern");

/***/ }),

/***/ 163:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromOlEvent = undefined;

var _fromOlEvent2 = __webpack_require__(31);

var _fromOlEvent3 = _interopRequireDefault(_fromOlEvent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.fromOlEvent = _fromOlEvent3.default; /**
                                              * RxJS extensions.
                                              */

/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fromOlEvent;

var _Observable = __webpack_require__(6);

__webpack_require__(120);

/**
 * Creates an Observable using OpenLayers event pattern that emits events of a specific type
 * coming from the given event target.
 *
 * @example <caption>Subscribe on view center change events</caption>
 * const map = ol.Map({ ... })
 * const changes = Observable.fromOlEvent(map.getView(), 'change:center')
 *
 * changes.subscribe(coordinate => console.log(coordinate))
 *
 * @param {ol.Object} target OpenLayers event target.
 * @param {string} eventName The event name of interest, being emitted by the `target`.
 * @param {function(...*): *} [selector] An optional function to post-process results. It takes the arguments
 *    from the event handler and should return a single value.
 * @return {Observable<T>}
 * @memberOf {Observable}
 */
function fromOlEvent(target, eventName, selector) {
  return _Observable.Observable.fromEventPattern(function (handler) {
    return target.on(eventName, handler);
  }, function (handler) {
    return target.un(eventName, handler);
  }, selector);
}

_Observable.Observable.fromOlEvent = fromOlEvent;

/***/ }),

/***/ 6:
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map