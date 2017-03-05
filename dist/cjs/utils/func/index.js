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
/******/ 	return __webpack_require__(__webpack_require__.s = 165);
/******/ })
/************************************************************************/
/******/ ({

/***/ 165:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = __webpack_require__(20);

var _keys2 = _interopRequireDefault(_keys);

var _templateSettings2 = __webpack_require__(59);

var _templateSettings3 = _interopRequireDefault(_templateSettings2);

var _isString2 = __webpack_require__(57);

var _isString3 = _interopRequireDefault(_isString2);

exports.isNumeric = isNumeric;
exports.coalesce = coalesce;
exports.round = round;
exports.replaceTokens = replaceTokens;
exports.isTemplate = isTemplate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {*} value
 * @return {boolean} True if value is number or numeric string.
 */
function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * @param {...*} [args]
 *
 * @return {*}
 */
function coalesce() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.find(function (val) {
    return val != null;
  });
}

/**
 * @param {number} num
 * @param {number} [precision=0]
 * @return {number}
 */
function round(num) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return Number(Math.round(Number(num + 'e+' + precision)) + 'e-' + precision);
}

/**
 * Replaces `tokens` in the `string` by values from the `replaces`.
 *
 * @param {string} string
 * @param {Object} replaces
 *
 * @returns {string}
 */
function replaceTokens(string, replaces) {
  var regExp = new RegExp((0, _keys2.default)(replaces).map(function (field) {
    return '(\\{' + field + '\\})';
  }).join('|'), 'ig');

  return string.replace(regExp, function (match) {
    return replaces[match.substr(1, match.length - 2)] || '';
  });
}

/**
 * Check if string is lodash template string.
 * @param {string} value
 * @return {boolean}
 */
function isTemplate(value) {
  return (0, _isString3.default)(value) && (value.search(_templateSettings3.default.interpolate) !== -1 || value.search(_templateSettings3.default.evaluate) !== -1);
}

/***/ }),

/***/ 20:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),

/***/ 57:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isString");

/***/ }),

/***/ 59:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/templateSettings");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map