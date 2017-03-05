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
/******/ 	return __webpack_require__(__webpack_require__.s = 142);
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

/***/ 12:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),

/***/ 13:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isFunction");

/***/ }),

/***/ 14:
/***/ (function(module, exports) {

module.exports = require("rxjs/add/operator/distinctUntilChanged");

/***/ }),

/***/ 142:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _view = __webpack_require__(44);

var _view2 = _interopRequireDefault(_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_view2.default.install = function (Vue) {
  Vue.component(_view2.default.name, _view2.default);
};

exports.default = _view2.default;

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

/***/ 4:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/rx-subs");

/***/ }),

/***/ 44:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(88)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(74),
  /* template */
  null,
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 6:
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = __webpack_require__(12);

var _promise2 = _interopRequireDefault(_promise);

var _isEqual2 = __webpack_require__(8);

var _isEqual3 = _interopRequireDefault(_isEqual2);

var _isFunction2 = __webpack_require__(13);

var _isFunction3 = _interopRequireDefault(_isFunction2);

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

var props = {
  zoom: {
    type: Number,
    default: _vlOl.consts.MIN_ZOOM
  },
  center: {
    type: Array,
    default: function _default() {
      return [0, 0];
    },
    validator: function validator(value) {
      return value.length === 2;
    }
  },
  rotation: {
    type: Number,
    default: 0
  },
  maxZoom: {
    type: Number,
    default: _vlOl.consts.MAX_ZOOM
  },
  minZoom: {
    type: Number,
    default: _vlOl.consts.MIN_ZOOM
  },
  projection: {
    type: String,
    default: _vlOl.consts.MAP_PROJECTION
  },
  enableRotation: {
    type: Boolean,
    default: true
  },
  extent: {
    type: Array,
    validator: function validator(value) {
      return value.length === 4;
    }
  },
  maxResolution: Number,
  minResolution: Number,
  resolution: Array,
  zoomFactor: {
    type: Number,
    default: _vlOl.consts.ZOOM_FACTOR
  }
};

var methods = {
  /**
   * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
   */
  fit: function fit(geometryOrExtent, options) {
    this.view.fit(geometryOrExtent, options);
  },

  /**
   * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
   * @param {...Object} args
   * @return {Promise}
   */
  animate: function animate() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var cb = args.find(_isFunction3.default);

    return new _promise2.default(function (resolve) {
      var _view;

      return (_view = _this.view).animate.apply(_view, args.concat([function (complete) {
        cb && cb(complete);
        resolve(complete);
      }]));
    });
  },
  refresh: function refresh() {
    this.view.changed();
  },
  setCurrentView: function setCurrentView(_ref) {
    var center = _ref.center,
        zoom = _ref.zoom,
        rotation = _ref.rotation;

    if (center != null && !(0, _isEqual3.default)(center, this.currentCenter)) {
      this.view.setCenter(_openlayers2.default.proj.fromLonLat(center, this.projection));
    }
    if (zoom != null && zoom !== this.currentZoom) {
      this.view.setZoom(zoom);
    }
    if (rotation != null && rotation !== this.currentRotation) {
      this.view.setRotation(rotation);
    }
  },
  subscribeAll: function subscribeAll() {
    subscribeToViewChanges.call(this);
  },
  mountView: function mountView() {
    if (!this.map()) {
      (0, _debug.warn)("Invalid usage of view component, should have map component among it's ancestors");
    }

    var view = this.map().getView();

    if (view && view.$vm) {
      if (process.env.NODE_ENV !== 'production') {
        (0, _debug.warn)('Map already has unmounted vl-view component. ' + 'It will be replaced with new.');
      }
      view.$vm.unmountView();
    }

    this.map().setView(this.view);
    this.subscribeAll();
  },
  unmountView: function unmountView() {
    this.unsubscribeAll();
    this.map() && this.map().setView(undefined);
  }
};
// todo watch other props
var watch = {
  center: function center(_center) {
    this.setCurrentView({ center: _center });
  },
  zoom: function zoom(_zoom) {
    this.setCurrentView({ zoom: _zoom });
  },
  rotation: function rotation(_rotation) {
    this.setCurrentView({ rotation: _rotation });
  }
};

exports.default = {
  name: 'vl-map-view',
  inject: ['map'],
  mixins: [_rxSubs2.default],
  props: props,
  methods: methods,
  watch: watch,
  render: function render(h) {
    return h();
  },
  data: function data() {
    return {
      currentZoom: this.zoom,
      currentCenter: this.center.slice(),
      currentRotation: this.rotation
    };
  },
  created: function created() {
    createView.call(this);
  },
  mounted: function mounted() {
    this.mountView();
  },
  destroyed: function destroyed() {
    this.unmountView();
    this.view = undefined;
  }
};

/**
 * @return {ol.View}
 */

function createView() {
  /**
   * @type {ol.View}
   * @protected
   */
  this.view = new _openlayers2.default.View({
    center: _openlayers2.default.proj.fromLonLat(this.currentCenter, this.projection),
    zoom: this.currentZoom,
    maxZoom: this.maxZoom,
    minZoom: this.minZoom,
    projection: this.projection
  });
  this.view.$vm = this;

  return this.view;
}

/**
 * Subscribe to OpenLayers significant events
 */
function subscribeToViewChanges() {
  var _this2 = this;

  var viewChanges = _Observable.Observable.fromOlEvent(this.view, 'change').throttleTime(300).map(function () {
    var center = _openlayers2.default.proj.toLonLat(_this2.view.getCenter(), _this2.projection);
    var zoom = Math.ceil(_this2.view.getZoom());
    var rotation = _this2.view.getRotation();

    return { center: center, zoom: zoom, rotation: rotation };
  }).distinctUntilChanged(function (a, b) {
    return (0, _isEqual3.default)(a, b);
  });

  this.rxSubs.viewChanges = viewChanges.subscribe(function (_ref2) {
    var center = _ref2.center,
        zoom = _ref2.zoom,
        rotation = _ref2.rotation;

    _this2.currentCenter = center;
    _this2.currentZoom = zoom;
    _this2.currentRotation = rotation;
    _this2.$emit('change', { center: center, zoom: zoom, rotation: rotation });
  }, _debug.errordbg);
}

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isEqual");

/***/ }),

/***/ 88:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map