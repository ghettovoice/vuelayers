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
/******/ 	return __webpack_require__(__webpack_require__.s = 126);
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

/***/ 10:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/style-target");

/***/ }),

/***/ 105:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 108:
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('i', {
    staticStyle: {
      "display": "none !important"
    }
  }, [_vm._t("default", null, {
    feature: _vm.plain
  })], 2)
},staticRenderFns: []}

/***/ }),

/***/ 117:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/omit");

/***/ }),

/***/ 126:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _feature = __webpack_require__(32);

var _feature2 = _interopRequireDefault(_feature);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_feature2.default.install = function (Vue) {
  Vue.component(_feature2.default.name, _feature2.default);
};

exports.default = _feature2.default;

/***/ }),

/***/ 24:
/***/ (function(module, exports) {

module.exports = require("uuid/v4");

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/debug");

/***/ }),

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(105)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(62),
  /* template */
  __webpack_require__(108),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),

/***/ 62:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = __webpack_require__(7);

var _extends3 = _interopRequireDefault(_extends2);

var _omit2 = __webpack_require__(117);

var _omit3 = _interopRequireDefault(_omit2);

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _v = __webpack_require__(24);

var _v2 = _interopRequireDefault(_v);

var _target = __webpack_require__(10);

var _target2 = _interopRequireDefault(_target);

var _debug = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//

/**
 * Wrapper around ol.Feature.
 *
 * @todo Add property 'visible', like in layer. If visible = false -> set null style
 */
var props = {
  id: {
    type: [String, Number],
    default: function _default() {
      return (0, _v2.default)();
    }
  },
  data: {
    type: Object,
    default: function _default() {
      return {};
    }
  }
};

var methods = {
  refresh: function refresh() {
    this.feature && this.feature.changed();
  },
  plain: function plain() {
    var obj = {
      id: this.id,
      layer: this.layer() && this.layer().$vm.id,
      data: this.data
    };

    var geom = this.feature.getGeometry();
    if (geom) {
      obj.geometry = {
        type: geom.getType(),
        coordinates: geom.getCoordinates()
      };
    }

    return obj;
  },
  styleTarget: function styleTarget() {
    return this.feature;
  }
};

var watch = {
  id: function id(value) {
    this.feature.setId(value);
  },
  data: function data(value) {
    this.feature.setProperties((0, _omit3.default)(['geometry'], value));
  }
};

var styleTargetProvide = _target2.default.provide;
exports.default = {
  name: 'vl-feature',
  mixins: [_target2.default],
  inject: ['layer', 'source'],
  props: props,
  methods: methods,
  watch: watch,
  provide: function provide() {
    var _this = this;

    return (0, _extends3.default)({}, styleTargetProvide.call(this), {
      feature: function feature() {
        return _this.feature;
      }
    });
  },
  created: function created() {
    createFeature.call(this);
  },
  mounted: function mounted() {
    if (this.source()) {
      this.source().addFeature(this.feature);
    } else if (process.env.NODE_ENV !== 'production') {
      (0, _debug.warn)("Invalid usage of feature component, should have source component among it's ancestors");
    }
  },
  destroyed: function destroyed() {
    this.source() && this.source().removeFeature(this.feature);
    this.feature = undefined;
  }
};

/**
 * Create feature without inner style applying, feature level style
 * will be applied in the layer level style function.
 *
 * @return {ol.Feature}
 */

function createFeature() {
  /**
   * @type {ol.Feature}
   * @protected
   */
  this.feature = new _openlayers2.default.Feature((0, _omit3.default)(['geometry'], this.data));
  this.feature.setId(this.id);
  this.feature.$vm = this;

  return this.feature;
}

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/extends");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map