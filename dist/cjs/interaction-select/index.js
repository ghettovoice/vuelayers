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
/******/ 	return __webpack_require__(__webpack_require__.s = 136);
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

/***/ 11:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/rx");

/***/ }),

/***/ 111:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/difference");

/***/ }),

/***/ 113:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/forEach");

/***/ }),

/***/ 122:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/mixins/interaction");

/***/ }),

/***/ 136:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _select = __webpack_require__(40);

var _select2 = _interopRequireDefault(_select);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_select2.default.install = function (Vue) {
  Vue.component(_select2.default.name, _select2.default);
};

exports.default = _select2.default;

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/ol");

/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/debug");

/***/ }),

/***/ 40:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(91)

var Component = __webpack_require__(1)(
  /* script */
  __webpack_require__(70),
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

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/extends");

/***/ }),

/***/ 70:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = __webpack_require__(7);

var _extends3 = _interopRequireDefault(_extends2);

var _difference2 = __webpack_require__(111);

var _difference3 = _interopRequireDefault(_difference2);

var _forEach2 = __webpack_require__(113);

var _forEach3 = _interopRequireDefault(_forEach2);

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _Observable = __webpack_require__(6);

__webpack_require__(11);

var _debug = __webpack_require__(3);

var _vlOl = __webpack_require__(2);

var _interaction = __webpack_require__(122);

var _interaction2 = _interopRequireDefault(_interaction);

var _target = __webpack_require__(10);

var _target2 = _interopRequireDefault(_target);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo add other options, like event modifiers
var props = {
  multi: {
    type: Boolean,
    default: false
  },
  wrapX: {
    type: Boolean,
    default: true
  },
  selected: {
    type: Array,
    default: function _default() {
      return [];
    }
  }
};

var interactionRefresh = _interaction2.default.methods.refresh;
var methods = {
  /**
   * @protected
   */
  subscribeAll: function subscribeAll() {
    subscribeToInteractionChanges.call(this);
  },

  /**
   * @return {ol.interaction.Select}
   * @protected
   */
  createInteraction: function createInteraction() {
    var defaultStyles = _vlOl.style.defaultEditStyle();
    var styleFunc = (0, _target.createStyleFunc)(this);
    var style = function __selectStyleFunc(feature, resolution) {
      var styles = styleFunc(feature, resolution);
      if (styles === null || Array.isArray(styles) && styles.length) {
        return styles;
      }

      return feature.getGeometry() != null ? defaultStyles[feature.getGeometry().getType()] : null;
    };
    var serviceFeatures = this.serviceLayer() && this.serviceLayer().getSource().getFeatures();

    return new _openlayers2.default.interaction.Select({
      multi: this.multi,
      filter: function filter(feature) {
        return !serviceFeatures.includes(feature);
      },
      style: style
    });
  },
  refresh: function refresh() {
    this.interaction && this.interaction.getFeatures().changed();
    interactionRefresh.call(this);
  },

  /**
   * @param {number} id
   */
  select: function select(id) {
    var selection = this.interaction.getFeatures();
    var layers = this.map().getLayers().getArray().filter(function (layer) {
      return layer.$vm && layer instanceof _openlayers2.default.layer.Vector;
    });

    if (this.currentSelected.includes(id)) return;

    var feature = void 0;
    (0, _forEach3.default)(function (layer) {
      feature = layer.getSource().getFeatureById(id);
      return !feature;
    }, layers);

    feature && selection.push(feature);
  },

  /**
   * @param {number} id
   */
  unselect: function unselect(id) {
    var selection = this.interaction.getFeatures();
    var selectionArray = selection.getArray();
    var idx = selectionArray.findIndex(function (feature) {
      return feature.getId() === id;
    });

    if (idx !== -1) {
      selection.removeAt(idx);
    }
  },
  unselectAll: function unselectAll() {
    this.interaction.getFeatures().clear();
  },
  styleTarget: function styleTarget() {
    return this.interaction;
  },
  setStyle: function setStyle(style) {
    this.styles = style;
    this.refresh();
  }
};

var watch = {
  selected: function selected(_selected) {
    var _this = this;

    var forSelect = (0, _difference3.default)(_selected, this.currentSelected);
    var forUnselect = (0, _difference3.default)(this.currentSelected, _selected);

    forSelect.forEach(function (id) {
      return _this.select(id);
    });
    forUnselect.forEach(function (id) {
      return _this.unselect(id);
    });
  }
};

var interactionProvide = _interaction2.default.provide;
var styleTargetProvide = _target2.default.provide;
exports.default = {
  name: 'vl-interaction-select',
  mixins: [_interaction2.default, _target2.default],
  inject: ['map', 'serviceLayer'],
  props: props,
  methods: methods,
  watch: watch,
  provide: function provide() {
    return (0, _extends3.default)({}, interactionProvide.call(this), styleTargetProvide.call(this));
  },
  data: function data() {
    return {
      currentSelected: this.selected.slice()
    };
  }
};


function subscribeToInteractionChanges() {
  var _this2 = this;

  var selection = this.interaction.getFeatures();

  this.rxSubs.select = _Observable.Observable.fromOlEvent(selection, 'add', function (evt) {
    return evt.element;
  }).subscribe(function (feature) {
    _this2.currentSelected.push(feature.getId());
    _this2.$emit('select', feature.getId());
  }, _debug.errordbg);
  this.rxSubs.unselect = _Observable.Observable.fromOlEvent(selection, 'remove', function (evt) {
    return evt.element;
  }).subscribe(function (feature) {
    _this2.currentSelected = _this2.currentSelected.filter(function (x) {
      return x !== feature.getId();
    });
    _this2.$emit('unselect', feature.getId());
  }, _debug.errordbg);
}

/***/ }),

/***/ 91:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });
//# sourceMappingURL=index.js.map