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
/******/ 	return __webpack_require__(__webpack_require__.s = 143);
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

/***/ 107:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "vl-map"
  }, [_c('div', {
    ref: "map",
    staticClass: "map",
    attrs: {
      "tabindex": _vm.tabIndex
    }
  }), _vm._v(" "), _vm._t("default")], 2)
},staticRenderFns: []}

/***/ }),

/***/ 143:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = __webpack_require__(43);

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_map2.default.install = function (Vue) {
  Vue.component(_map2.default.name, _map2.default);
}; /**
    * VueLayers map component
    */
exports.default = _map2.default;

/***/ }),

/***/ 43:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(99)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(73),
  /* template */
  __webpack_require__(107),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  loadTilesWhileAnimating: {
    type: Boolean,
    default: false
  },
  loadTilesWhileInteracting: {
    type: Boolean,
    default: false
  },
  pixelRatio: Number,
  renderer: [String, Array],
  logo: [String, Object],
  keyboardEventTarget: [String, Node],
  tabIndex: {
    type: Number,
    default: 0
  }
}; //
//
//
//
//
//
//

var methods = {
  /**
   * Updates `ol.Map` view
   */
  refresh: function refresh() {
    this.map.updateSize();
    this.map.render();
  },

  /**
   * Trigger focus on map container.
   */
  focus: function focus() {
    this.$el.tabIndex = 0;
    this.$el.focus();
  }
};

exports.default = {
  name: 'vl-map',
  props: props,
  methods: methods,
  provide: function provide() {
    var _this = this;

    return {
      map: function map() {
        return _this.map;
      },
      serviceLayer: function serviceLayer() {
        return _this.serviceLayer;
      },
      view: function view() {
        return _this.map.getView();
      }
    };
  },
  created: function created() {
    createMap.call(this);
  },
  mounted: function mounted() {
    var _this2 = this;

    this.map.setTarget(this.$refs.map);
    this.$nextTick(function () {
      _this2.refresh();
    });
  },
  destroyed: function destroyed() {
    this.serviceLayer.setMap(undefined);
    this.map.setTarget(undefined);
    this.map = this.serviceLayer = undefined;
  }
};

/**
 * @return {ol.Map}
 */

function createMap() {
  /**
   * @type {ol.Map}
   * @protected
   */
  this.map = new _openlayers2.default.Map({
    layers: [],
    // todo disable all default interaction and controls and use custom if defined, wrap all
    //      interactions: [],
    //      controls: [],
    loadTilesWhileAnimating: this.loadTilesWhileAnimating,
    loadTilesWhileInteracting: this.loadTilesWhileInteracting,
    pixelRatio: this.pixelRatio,
    renderer: this.renderer,
    logo: this.logo,
    keyboardEventTarget: this.keyboardEventTarget
  });

  this.map.$vm = this;

  this.serviceLayer = new _openlayers2.default.layer.Vector({
    map: this.map,
    source: new _openlayers2.default.source.Vector()
  });

  return this.map;
}

/***/ }),

/***/ 99:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map