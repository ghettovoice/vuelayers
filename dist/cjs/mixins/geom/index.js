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
/******/ 	return __webpack_require__(__webpack_require__.s = 128);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/rx");

/***/ }),

/***/ 128:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = __webpack_require__(55);

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _isEqual2 = __webpack_require__(8);

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _Observable = __webpack_require__(6);

__webpack_require__(16);

__webpack_require__(14);

__webpack_require__(15);

__webpack_require__(11);

var _rxSubs = __webpack_require__(4);

var _rxSubs2 = _interopRequireDefault(_rxSubs);

var _vlOl = __webpack_require__(2);

var _debug = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true,
    validator: function validator(value) {
      return Array.isArray(value) && value.length;
    }
  },
  layout: {
    type: String,
    default: 'XY'
  }
};

var computed = {
  type: function type() {
    return this.geometry.getType();
  }
};

var methods = {
  /**
   * @protected
   */
  initialize: function initialize() {
    /**
     * @type {ol.geom.SimpleGeometry}
     * @protected
     */
    this.geometry = this.createGeometry();
    this.geometry.$vm = this;
    /**
     * @protected
     */
    this.coordTransform = _vlOl.coord.coordTransform[this.geometry.getType()];

    this.currentCoordinates = this.coordTransform.toLonLat(this.geometry.getCoordinates(), this.view().getProjection());
    this.currentExtent = _vlOl.coord.extentToLonLat(this.geometry.getExtent(), this.view().getProjection());
  },

  /**
   * @return {ol.geom.SimpleGeometry}
   * @protected
   */
  createGeometry: function createGeometry() {
    throw new Error('Not implemented method');
  },
  subscribeAll: function subscribeAll() {
    subscribeToGeomChanges.call(this);
  },

  /**
   * @protected
   */
  mountGeometry: function mountGeometry() {
    if (this.feature()) {
      this.feature().setGeometry(this.geometry);
      this.subscribeAll();
    } else if (process.env.NODE_ENV !== 'production') {
      (0, _debug.warn)("Invalid usage of geometry component, should have feature component among it's ancestors");
    }
  },

  /**
   * @protected
   */
  unmountGeometry: function unmountGeometry() {
    this.unsubscribeAll();
    this.feature() && this.feature().setGeometry(undefined);
  },
  refresh: function refresh() {
    this.geometry && this.geometry.changed();
  }
};

var watch = {
  coordinates: function coordinates(value) {
    this.geometry.setCoordinates(this.coordTransform.fromLonLat(value, this.view().getProjection()));
  }
};

exports.default = {
  mixins: [_rxSubs2.default],
  inject: ['view', 'feature'],
  props: props,
  computed: computed,
  watch: watch,
  methods: methods,
  provide: function provide() {
    var _this = this;

    return {
      geometry: function geometry() {
        return _this.geometry;
      }
    };
  },

  render: function render(h) {
    return h();
  },
  data: function data() {
    return {
      currentCoordinates: this.coordinates.slice(),
      currentExtent: []
    };
  },
  created: function created() {
    this.initialize();
  },
  mounted: function mounted() {
    this.mountGeometry();
  },
  destroyed: function destroyed() {
    this.unmountGeometry();
    this.geometry = undefined;
  }
};


function subscribeToGeomChanges() {
  var _this2 = this,
      _context;

  this.rxSubs.geomChanges = _Observable.Observable.fromOlEvent(this.geometry, 'change').throttleTime(100).map(function () {
    return [_this2.coordTransform.toLonLat(_this2.geometry.getCoordinates(), _this2.view().getProjection()), _vlOl.coord.extentToLonLat(_this2.geometry.getExtent(), _this2.view().getProjection())];
  }).distinctUntilChanged(function (a, b) {
    return (0, _isEqual3.default)(a, b);
  }).subscribe(function (_ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
        coordinates = _ref2[0],
        extent = _ref2[1];

    _this2.currentCoordinates = coordinates;
    _this2.currentExtent = extent;
    _this2.$emit('change', { coordinates: coordinates, extent: extent });
  }, (_context = console).error.bind(_context));
}

/***/ }),

/***/ 14:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/operator/distinctUntilChanged");

/***/ }),

/***/ 15:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/operator/map");

/***/ }),

/***/ 16:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/operator/throttleTime");

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

/***/ }),

/***/ 55:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/slicedToArray");

/***/ }),

/***/ 6:
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isEqual");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map