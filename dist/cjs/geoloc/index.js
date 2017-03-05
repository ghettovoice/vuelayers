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
/******/ 	return __webpack_require__(__webpack_require__.s = 127);
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

/***/ 11:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/rx");

/***/ }),

/***/ 127:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _geoloc = __webpack_require__(33);

var _geoloc2 = _interopRequireDefault(_geoloc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_geoloc2.default.install = function (Vue) {
  Vue.component(_geoloc2.default.name, _geoloc2.default);
};

exports.default = _geoloc2.default;

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

/***/ 25:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/observable/combineLatest");

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/debug");

/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(93)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(63),
  /* template */
  null,
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 4:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/rx-subs");

/***/ }),

/***/ 6:
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ }),

/***/ 63:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEqual2 = __webpack_require__(8);

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _Observable = __webpack_require__(6);

__webpack_require__(25);

__webpack_require__(14);

__webpack_require__(16);

__webpack_require__(15);

__webpack_require__(11);

var _debug = __webpack_require__(3);

var _rxSubs = __webpack_require__(4);

var _rxSubs2 = _interopRequireDefault(_rxSubs);

var _vlOl = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  import positionMarker from './position-marker.svg'

var props = {
  tracking: {
    type: Boolean,
    default: true
  },
  projection: {
    type: String,
    default: _vlOl.consts.MAP_PROJECTION
  }
};

var methods = {
  refresh: function refresh() {
    this.geoloc.changed();
  }
};

var watch = {
  tracking: function tracking(value) {
    this.geoloc.setTracking(value);
  }
};

exports.default = {
  name: 'vl-geoloc',
  mixins: [_rxSubs2.default],
  inject: ['serviceLayer'],
  props: props,
  watch: watch,
  methods: methods,
  render: function render(h) {
    return h();
  },
  data: function data() {
    return {
      currentPosition: undefined,
      currentAccuracy: undefined
    };
  },
  created: function created() {
    createGeolocApi.call(this);
    subscribeToGeolocation.call(this);
  },
  destroyed: function destroyed() {
    this.geoloc.setTracking(false);
    //      this.serviceLayer() && this.serviceLayer().getSource().removeFeature(this.positionFeature)
    this.geoloc = this.positionFeature = undefined;
  }
};

/**
 * @return {ol.Geolocation}
 */

function createGeolocApi() {
  /**
   * @type {ol.Geolocation}
   * @protected
   */
  this.geoloc = new _openlayers2.default.Geolocation({
    tracking: this.tracking,
    projection: this.projection
  });

  this.geoloc.$vm = this;
  /**
   * @type {ol.Feature}
   * @protected
   */
  //    this.positionFeature = new ol.Feature({
  //      internal: true
  //    })
  //    this.positionFeature.setStyle(new ol.style.Style({
  //      image: new ol.style.Icon({
  //        src: positionMarker,
  //        scale: 0.85,
  //        anchor: [ 0.5, 1 ]
  //      })
  //    }))
  //    this.serviceLayer() && this.serviceLayer().getSource().addFeature(this.positionFeature)

  return this.geoloc;
}

function subscribeToGeolocation() {
  var _this = this;

  var geolocChanges = _Observable.Observable.fromOlEvent(this.geoloc, 'change').throttleTime(100).map(function () {
    var position = _openlayers2.default.proj.toLonLat(_this.geoloc.getPosition(), _this.projection);
    var accuracy = _this.geoloc.getAccuracy();

    return { position: position, accuracy: accuracy };
  }).distinctUntilChanged(function (a, b) {
    return (0, _isEqual3.default)(a, b);
  });

  this.rxSubs.geoloc = geolocChanges.subscribe(function (_ref) {
    var position = _ref.position,
        accuracy = _ref.accuracy;

    _this.currentPosition = position;
    _this.currentAccuracy = accuracy;
    _this.$emit('change', { position: position, accuracy: accuracy });
  }, _debug.errordbg);
}

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isEqual");

/***/ }),

/***/ 93:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map