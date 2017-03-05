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
/******/ 	return __webpack_require__(__webpack_require__.s = 162);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

module.exports = require("openlayers");

/***/ }),

/***/ 109:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/math/log10");

/***/ }),

/***/ 110:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),

/***/ 112:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/flow");

/***/ }),

/***/ 114:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isEmpty");

/***/ }),

/***/ 115:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/lowerFirst");

/***/ }),

/***/ 116:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/merge");

/***/ }),

/***/ 118:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/reduce");

/***/ }),

/***/ 119:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/upperFirst");

/***/ }),

/***/ 12:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),

/***/ 162:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coord = exports.style = exports.helpers = exports.consts = undefined;

var _consts2 = __webpack_require__(19);

var _consts = _interopRequireWildcard(_consts2);

var _helpers2 = __webpack_require__(29);

var _helpers = _interopRequireWildcard(_helpers2);

var _style2 = __webpack_require__(30);

var _style = _interopRequireWildcard(_style2);

var _coord2 = __webpack_require__(28);

var _coord = _interopRequireWildcard(_coord2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.consts = _consts; /**
                           * OpenLayers 3 helpers and constants
                           */

exports.helpers = _helpers;
exports.style = _style;
exports.coord = _coord;

/***/ }),

/***/ 17:
/***/ (function(module, exports) {

module.exports = require("vuelayers/dist/cjs/utils/func");

/***/ }),

/***/ 19:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GEOMETRY_TYPE = exports.WGS84_SPHERE = exports.EARTH_RADIUS = exports.PIXEL_RATIO = exports.CACHE_SIZE = exports.ZOOM_FACTOR = exports.TILE_SIZE = exports.MIN_ZOOM = exports.MAX_ZOOM = exports.DATA_PROJECTION = exports.MAP_PROJECTION = undefined;

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @type {string} Default map projection.
 */
var MAP_PROJECTION = exports.MAP_PROJECTION = 'EPSG:3857';
/**
 * @type {string} Default data source projection.
 */
var DATA_PROJECTION = exports.DATA_PROJECTION = 'EPSG:4326';
/**
 * @type {number} Default map max zoom
 */
var MAX_ZOOM = exports.MAX_ZOOM = 28;
/**
 * @type {number} Default map min zoom
 */
var MIN_ZOOM = exports.MIN_ZOOM = 0;
/**
 * @type {number} Default tile size
 */
var TILE_SIZE = exports.TILE_SIZE = 256;
/**
 * @type {number} Default zoom factor
 */
var ZOOM_FACTOR = exports.ZOOM_FACTOR = 2;
/**
 * @type {number}
 */
var CACHE_SIZE = exports.CACHE_SIZE = 2048;
/**
 * @type {number}
 */
var PIXEL_RATIO = exports.PIXEL_RATIO = 1;
/**
 * @type {number} Earth radius in meters
 */
var EARTH_RADIUS = exports.EARTH_RADIUS = 6378137;
var WGS84_SPHERE = exports.WGS84_SPHERE = new _openlayers2.default.Sphere(EARTH_RADIUS);

var GEOMETRY_TYPE = exports.GEOMETRY_TYPE = {
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
  GEOMETRY_COLLECTION: 'GeometryCollection',
  CIRCLE: 'Circle'
};

/***/ }),

/***/ 23:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/pick");

/***/ }),

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.coordTransform = undefined;
exports.extentFromLonLat = extentFromLonLat;
exports.extentToLonLat = extentToLonLat;
exports.pointToLonLat = pointToLonLat;
exports.pointFromLonLat = pointFromLonLat;
exports.lineToLonLat = lineToLonLat;
exports.lineFromLonLat = lineFromLonLat;
exports.polygonToLonLat = polygonToLonLat;
exports.polygonFromLonLat = polygonFromLonLat;
exports.multiPointToLonLat = multiPointToLonLat;
exports.multiPointFromLonLat = multiPointFromLonLat;
exports.multiLineToLonLat = multiLineToLonLat;
exports.multiLineFromLonLat = multiLineFromLonLat;
exports.multiPolygonToLonLat = multiPolygonToLonLat;
exports.multiPolygonFromLonLat = multiPolygonFromLonLat;

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _consts = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
function extentFromLonLat(extent) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return _openlayers2.default.proj.transformExtent(extent, _consts.DATA_PROJECTION, projection);
}

/**
 * @param {ol.Extent} extent
 * @param {ol.ProjectionLike} projection
 * @return {ol.Extent}
 */
function extentToLonLat(extent) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return _openlayers2.default.proj.transformExtent(extent, projection, _consts.DATA_PROJECTION);
}

function pointToLonLat(coordinate) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return _openlayers2.default.proj.toLonLat(coordinate, projection);
}
function pointFromLonLat(coordinate) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return _openlayers2.default.proj.fromLonLat(coordinate, projection);
}

function lineToLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (point) {
    return pointToLonLat(point, projection);
  });
}
function lineFromLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (point) {
    return pointFromLonLat(point, projection);
  });
}

function polygonToLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (line) {
    return lineToLonLat(line, projection);
  });
}
function polygonFromLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (line) {
    return lineFromLonLat(line, projection);
  });
}

function multiPointToLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (point) {
    return pointToLonLat(point, projection);
  });
}
function multiPointFromLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (point) {
    return pointFromLonLat(point, projection);
  });
}

function multiLineToLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (line) {
    return lineToLonLat(line, projection);
  });
}
function multiLineFromLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (line) {
    return lineFromLonLat(line, projection);
  });
}

function multiPolygonToLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (polygon) {
    return polygonToLonLat(polygon, projection);
  });
}
function multiPolygonFromLonLat(coordinates) {
  var projection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _consts.MAP_PROJECTION;

  return coordinates.map(function (polygon) {
    return polygonFromLonLat(polygon, projection);
  });
}

var coordTransform = exports.coordTransform = {
  Point: {
    toLonLat: pointToLonLat,
    fromLonLat: pointFromLonLat
  },
  LineString: {
    toLonLat: lineToLonLat,
    fromLonLat: lineFromLonLat
  },
  Polygon: {
    toLonLat: polygonToLonLat,
    fromLonLat: polygonFromLonLat
  },
  MultiPoint: {
    toLonLat: multiPointToLonLat,
    fromLonLat: multiPointFromLonLat
  },
  MultiLineString: {
    toLonLat: multiLineToLonLat,
    fromLonLat: multiLineFromLonLat
  },
  MultiPolygon: {
    toLonLat: multiPolygonToLonLat,
    fromLonLat: multiPolygonFromLonLat
  }
};

/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = __webpack_require__(12);

var _promise2 = _interopRequireDefault(_promise);

var _log = __webpack_require__(109);

var _log2 = _interopRequireDefault(_log);

var _isEqual2 = __webpack_require__(8);

var _isEqual3 = _interopRequireDefault(_isEqual2);

exports.zoomToResolution = zoomToResolution;
exports.resolutionToZoom = resolutionToZoom;
exports.createAttributions = createAttributions;
exports.haversineDistance = haversineDistance;
exports.flyTo = flyTo;

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _consts = __webpack_require__(19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {number} zoom
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
function zoomToResolution(zoom) {
  var latitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;
  var tileSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _consts.TILE_SIZE;

  // meters per pixel at zoom = 0
  var mpp = 2 * Math.PI * _consts.EARTH_RADIUS / tileSize;

  return mpp * Math.cos(latitude) / Math.pow(2, zoom);
}
/**
 * @param {number} resolution
 * @param {number} [latitude=0.0]
 * @param {number} [tileSize=256]
 * @return {number}
 */
function resolutionToZoom(resolution) {
  var latitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;
  var tileSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _consts.TILE_SIZE;

  // meters per pixel at zoom = 0
  var mpp = 2 * Math.PI * _consts.EARTH_RADIUS / tileSize;

  return Math.round(Math.log(mpp * Math.cos(latitude) / resolution) / Math.log(2));
}

/**
 * @param {string[]} attributions
 * @return {ol.Attribution[]}
 */
function createAttributions(attributions) {
  return (attributions || []).map(function (html) {
    return new _openlayers2.default.Attribution({ html: html });
  });
}

/**
 * @param {number[]} p1 First point in EPSG:4326
 * @param {number[]} p2 Second point in EPSG:4326
 * @return {number} Distance in meters.
 */
function haversineDistance(p1, p2) {
  return _consts.WGS84_SPHERE.haversineDistance(p1, p2);
}

/**
 * @param {ol.View} view
 * @param {number[]} coordinate Coordinate in EPSG:4326
 * @param {number} zoom
 * @return {Promise}
 */
function flyTo(view, coordinate, zoom) {
  var currentZoom = Math.ceil(view.getZoom());
  var currentCenter = _openlayers2.default.proj.toLonLat(view.getCenter(), view.getProjection());
  var distance = haversineDistance(currentCenter, coordinate);
  var duration = (0, _log2.default)(distance / 1000) * 1000;

  var centerPromise = new _promise2.default(function (resolve) {
    return view.animate({
      center: coordinate,
      duration: duration
    }, resolve);
  });

  var zoomPromise = void 0;
  if (currentZoom >= 10 && distance >= 10000 && !(0, _isEqual3.default)(coordinate, currentCenter)) {
    zoomPromise = new _promise2.default(function (resolve) {
      return view.animate({
        zoom: Math.ceil(currentZoom / 2),
        duration: duration / 2
      }, {
        zoom: zoom,
        duration: duration / 2
      }, resolve);
    });
  } else {
    zoomPromise = new _promise2.default(function (resolve) {
      return view.animate({
        zoom: zoom,
        duration: duration
      });
    });
  }

  return _promise2.default.all([centerPromise, zoomPromise]);
}

/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformStyleHash = undefined;

var _assign = __webpack_require__(110);

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = __webpack_require__(7);

var _extends3 = _interopRequireDefault(_extends2);

var _reduce2 = __webpack_require__(118);

var _reduce3 = _interopRequireDefault(_reduce2);

var _merge2 = __webpack_require__(116);

var _merge3 = _interopRequireDefault(_merge2);

var _isEmpty2 = __webpack_require__(114);

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _lowerFirst2 = __webpack_require__(115);

var _lowerFirst3 = _interopRequireDefault(_lowerFirst2);

var _upperFirst2 = __webpack_require__(119);

var _upperFirst3 = _interopRequireDefault(_upperFirst2);

var _pick2 = __webpack_require__(23);

var _pick3 = _interopRequireDefault(_pick2);

var _flow2 = __webpack_require__(112);

var _flow3 = _interopRequireDefault(_flow2);

exports.getDefaultStyleHash = getDefaultStyleHash;
exports.createStyleFunc = createStyleFunc;
exports.transformStyle = transformStyle;
exports.transformFillStyle = transformFillStyle;
exports.transformStrokeStyle = transformStrokeStyle;
exports.transformImageStyle = transformImageStyle;
exports.transformTextStyle = transformTextStyle;
exports.defaultStyle = defaultStyle;
exports.defaultEditStyle = defaultEditStyle;

var _openlayers = __webpack_require__(0);

var _openlayers2 = _interopRequireDefault(_openlayers);

var _func = __webpack_require__(17);

var _consts = __webpack_require__(19);

var _consts2 = _interopRequireDefault(_consts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reduceWithKey = _reduce3.default.convert({ cap: false });

// Style helpers (get from geo-1.1)
/**
 * @typedef {Object} GeoStyle
 *
 * Shared
 * @property {string|number[]} fillColor
 * @property {string|number[]} strokeColor
 * @property {number} strokeWidth
 * @property {number[]} strokeDash
 * @property {string} strokeCap
 * @property {string} strokeJoin
 * @property {number} zIndex
 *
 * Text only
 * @property {string} text
 * @property {string} textFont
 * @property {number} textFontSize
 * @property {number} textScale
 * @property {string} textAlign
 * @property {number} textRotation
 * @property {number} textOffsetX
 * @property {number} textOffsetY
 *
 * Icon only
 * @property {string} iconUrl
 * @property {Image} iconImg
 * @property {number[]} iconSize
 * @property {number[]} iconImgSize
 * @property {number} iconOffset
 * @property {number[]} iconAnchor
 * @property {number} iconScale
 * @property {number} iconRotation
 * @property {number} iconRadius
 * @property {number} iconRadius1
 * @property {number} iconRadius2
 * @property {number} iconPoints
 * @property {number} iconAngle
 * @property {number} iconOpacity
 * @property {ol.style.IconOrigin | undefined} iconAnchorOrigin
 * @property {ol.Color | string | undefined} iconColor
 * @property {ol.style.IconOrigin | undefined} iconOffsetOrigin
 */
function getDefaultStyleHash() {
  var default_ = {
    fillColor: [255, 255, 255, 0.7],
    strokeColor: [30, 54, 133, 1],
    strokeWidth: 3,
    strokeCap: 'round',
    strokeJoin: 'round',
    iconRadius: 7,
    textStrokeColor: [30, 54, 133, 1],
    textFillColor: [30, 54, 133, 1],
    textFont: 'sans-serif',
    textFontSize: 12,
    textStrokeWidth: 1
  };

  var select = (0, _extends3.default)({}, default_, {
    fillColor: [255, 255, 255, 0.8],
    strokeColor: [255, 121, 1, 1],
    textFillColor: [255, 121, 1, 1],
    textStrokeColor: [255, 121, 1, 1],
    zIndex: 1
  });

  var cluster = (0, _extends3.default)({}, default_, {
    text: '<%= item.clusterSize %>',
    iconUrl: null,
    iconImg: null,
    iconPoints: null,
    iconRadius: 20,
    textFontSize: 14,
    zIndex: 1
  });

  var modify = (0, _extends3.default)({}, default_, {
    fillColor: [255, 255, 255, 0.8],
    strokeColor: '#FF1E23',
    zIndex: 1
  });

  var current = (0, _extends3.default)({}, default_, {
    fillColor: [27, 226, 23, 0.8],
    strokeColor: [14, 118, 11, 1],
    strokeWidth: 4,
    zIndex: 1
  });

  return {
    default: [(0, _extends3.default)({}, default_)],
    select: [(0, _extends3.default)({}, select)],
    cluster: [(0, _extends3.default)({}, cluster)],
    remove: null,
    modify: [(0, _extends3.default)({}, modify)],
    current: [(0, _extends3.default)({}, current)]
  };
}

/**
 * @param {Object<string, GeoStyle[]>} styleHash
 * @return {Object<string, ol.style.Style[]>}
 * @function
 */
var transformStyleHash = exports.transformStyleHash = reduceWithKey(function (olStyleHash, geoStyles, styleName) {
  if (geoStyles && geoStyles.length) {
    var olStyle = geoStyles.map(transformStyle);

    if (!(0, _isEmpty3.default)(olStyle)) {
      olStyleHash[styleName] = olStyle;
    }
  }

  return olStyleHash;
});

/**
 * Returns style function for `styleHash` or default style function.
 *
 * @param {Object} [styleHash]
 * @return {ol.StyleFunction}
 */
function createStyleFunc(styleHash) {
  styleHash = (0, _merge3.default)(getDefaultStyleHash(), styleHash);

  // Static pre-compilation
  var olStyleHash = transformStyleHash({}, styleHash);

  return (
    /**
     * @param {ol.Feature} feature
     * @return {ol.style.Style[]}
     */
    function __styleFunc(feature) {
      var styleName = feature.get('styleName') || 'default';

      return olStyleHash[styleName];
    }
  );
}

/**
 * @param {GeoStyle} geoStyle
 * @return {ol.style.Style|undefined}
 */
function transformStyle(geoStyle) {
  if ((0, _isEmpty3.default)(geoStyle)) return;

  var olStyle = {
    text: transformTextStyle(geoStyle),
    fill: transformFillStyle(geoStyle),
    stroke: transformStrokeStyle(geoStyle),
    image: transformImageStyle(geoStyle),
    zIndex: geoStyle.zIndex
  };

  if (!(0, _isEmpty3.default)(olStyle)) {
    return new _openlayers2.default.style.Style(olStyle);
  }
}

var addPrefix = function addPrefix(prefix) {
  return function (str) {
    return prefix + (prefix ? (0, _upperFirst3.default)(str) : str);
  };
};

/**
 * @param {GeoStyle} geoStyle
 * @param {string} [prefix]
 * @returns {ol.style.Fill|undefined}
 */
function transformFillStyle(geoStyle) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var prefixKey = addPrefix(prefix);
  var keys = ['fillColor'].map(prefixKey);

  var transform = (0, _flow3.default)((0, _pick3.default)(keys), reduceWithKey(function (result, value, name) {
    name = (0, _lowerFirst3.default)(name.replace(new RegExp(prefixKey('fill')), ''));
    result[name] = value;

    return result;
  }, {}));

  var fillStyle = transform(geoStyle);

  if (!(0, _isEmpty3.default)(fillStyle)) {
    return new _openlayers2.default.style.Fill(fillStyle);
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @param {string} [prefix]
 * @returns {ol.style.Stroke|undefined}
 */
function transformStrokeStyle(geoStyle) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var prefixKey = addPrefix(prefix);
  var keys = ['strokeColor', 'strokeWidth', 'strokeDash', 'strokeCap', 'strokeJoin'].map(prefixKey);

  var transform = (0, _flow3.default)((0, _pick3.default)(keys), reduceWithKey(function (result, value, name) {
    switch (name) {
      case prefixKey('strokeColor'):
      case prefixKey('strokeWidth'):
        name = (0, _lowerFirst3.default)(name.replace(new RegExp(prefixKey('stroke')), ''));
        break;
      case prefixKey('strokeDash'):
      case prefixKey('strokeCap'):
      case prefixKey('strokeJoin'):
        name = 'line' + name.replace(new RegExp(prefixKey('stroke')), '');
        break;
    }

    result[name] = value;

    return result;
  }, {}));
  var strokeStyle = transform(geoStyle);

  if (!(0, _isEmpty3.default)(strokeStyle)) {
    return new _openlayers2.default.style.Stroke(strokeStyle);
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @returns {ol.style.Icon|ol.style.Circle|ol.style.RegularShape|undefined}
 */
function transformImageStyle(geoStyle) {
  if ((0, _isEmpty3.default)(geoStyle.iconUrl) && (0, _isEmpty3.default)(geoStyle.iconImg) && (0, _isEmpty3.default)(geoStyle.iconPoints) && !(0, _func.isNumeric)(geoStyle.iconRadius)) {
    return;
  }

  var imageStyle = void 0;

  if (!(0, _isEmpty3.default)(geoStyle.iconUrl) || !(0, _isEmpty3.default)(geoStyle.iconImg)) {
    // then create ol.style.Icon options
    imageStyle = (0, _extends3.default)({}, geoStyle, {
      type: 'icon',
      anchor: geoStyle.iconAnchor,
      anchorOrigin: geoStyle.iconAnchorOrigin,
      color: geoStyle.iconColor,
      offset: geoStyle.iconOffset,
      offsetOrigin: geoStyle.iconOffsetOrigin,
      opacity: geoStyle.iconOpacity,
      scale: geoStyle.iconScale,
      rotation: geoStyle.iconRotation,
      size: geoStyle.iconSize,
      imgSize: geoStyle.iconImgSize,
      src: geoStyle.iconUrl,
      crossOrigin: 'anonymous'
    });
  } else if (geoStyle.iconPoints != null) {
    // create ol.style.RegularShape options
    imageStyle = (0, _extends3.default)({}, geoStyle, {
      type: 'shape',
      points: geoStyle.iconPoints,
      radius: geoStyle.iconRadius,
      radius1: geoStyle.iconRadius1,
      radius2: geoStyle.iconRadius2,
      angle: geoStyle.iconAngle,
      rotation: geoStyle.iconRotation
    });
  } else {
    // create ol.style.Circle options
    imageStyle = (0, _extends3.default)({}, geoStyle, {
      type: 'circle',
      radius: geoStyle.iconRadius
    });
  }

  imageStyle = (0, _extends3.default)({}, imageStyle, {
    fill: transformFillStyle(geoStyle, 'icon') || transformFillStyle(geoStyle),
    stroke: transformStrokeStyle(geoStyle, 'icon') || transformStrokeStyle(geoStyle),
    snapToPixel: true
  });

  if (!(0, _isEmpty3.default)(imageStyle)) {
    return new _openlayers2.default.style[(0, _upperFirst3.default)(imageStyle.type)](imageStyle);
  }
}

/**
 * @param {GeoStyle} geoStyle
 * @returns {ol.style.Text|undefined}
 */
function transformTextStyle(geoStyle) {
  // noinspection JSValidateTypes
  if (geoStyle.text == null) {
    return;
  }

  var textStyle = {
    text: geoStyle.text
  };

  var fontSize = geoStyle.textFontSize ? geoStyle.textFontSize + 'px' : undefined;
  var font = ['normal', fontSize, geoStyle.textFont].filter(function (x) {
    return !!x;
  }).join(' ');

  (0, _assign2.default)(textStyle, (0, _pick3.default)(['textScale', 'textRotation', 'textOffsetX', 'textOffsetY', 'textAlign'])(geoStyle), {
    font: font,
    fill: transformFillStyle(geoStyle, 'text') || transformFillStyle(geoStyle),
    stroke: transformStrokeStyle(geoStyle, 'text') || transformStrokeStyle(geoStyle)
  });

  if (!(0, _isEmpty3.default)(textStyle)) {
    return new _openlayers2.default.style.Text(textStyle);
  }
}

/**
 * Default OpenLayers styles
 *
 * @return {ol.style.Style[]}
 * @see {@link https://github.com/openlayers/openlayers/blob/master/src/ol/style/style.js#L290}
 */
function defaultStyle() {
  // We don't use an immediately-invoked function
  // and a closure so we don't get an error at script evaluation time in
  // browsers that do not support Canvas. (ol.style.Circle does
  // canvas.getContext('2d') at construction time, which will cause an.error
  // in such browsers.)
  var fill = new _openlayers2.default.style.Fill({
    color: 'rgba(255,255,255,0.4)'
  });
  var stroke = new _openlayers2.default.style.Stroke({
    color: '#3399CC',
    width: 1.25
  });
  return [new _openlayers2.default.style.Style({
    image: new _openlayers2.default.style.Circle({
      fill: fill,
      stroke: stroke,
      radius: 5
    }),
    fill: fill,
    stroke: stroke
  })];
}

/**
 * Default OpenLayers edit style.
 *
 * @return {Object.<consts.GEOMETRY_TYPE, Array.<ol.style.Style>>}
 * @see {@link https://github.com/openlayers/openlayers/blob/master/src/ol/style/style.js#L324}
 */
function defaultEditStyle() {
  /** @type {Object.<consts.GEOMETRY_TYPE, Array.<ol.style.Style>>} */
  var styles = {};
  var white = [255, 255, 255, 1];
  var blue = [0, 153, 255, 1];
  var width = 3;

  styles[_consts2.default.GEOMETRY_TYPE.LINE_STRING] = [new _openlayers2.default.style.Style({
    stroke: new _openlayers2.default.style.Stroke({
      color: white,
      width: width + 2
    })
  }), new _openlayers2.default.style.Style({
    stroke: new _openlayers2.default.style.Stroke({
      color: blue,
      width: width
    })
  })];
  styles[_consts2.default.GEOMETRY_TYPE.MULTI_LINE_STRING] = styles[_consts2.default.GEOMETRY_TYPE.LINE_STRING];

  styles[_consts2.default.GEOMETRY_TYPE.POLYGON] = [new _openlayers2.default.style.Style({
    fill: new _openlayers2.default.style.Fill({
      color: [255, 255, 255, 0.5]
    })
  })].concat(styles[_consts2.default.GEOMETRY_TYPE.LINE_STRING]);
  styles[_consts2.default.GEOMETRY_TYPE.MULTI_POLYGON] = styles[_consts2.default.GEOMETRY_TYPE.POLYGON];

  styles[_consts2.default.GEOMETRY_TYPE.CIRCLE] = styles[_consts2.default.GEOMETRY_TYPE.POLYGON].concat(styles[_consts2.default.GEOMETRY_TYPE.LINE_STRING]);

  styles[_consts2.default.GEOMETRY_TYPE.POINT] = [new _openlayers2.default.style.Style({
    image: new _openlayers2.default.style.Circle({
      radius: width * 2,
      fill: new _openlayers2.default.style.Fill({
        color: blue
      }),
      stroke: new _openlayers2.default.style.Stroke({
        color: white,
        width: width / 2
      })
    }),
    zIndex: Infinity
  })];
  styles[_consts2.default.GEOMETRY_TYPE.MULTI_POINT] = styles[_consts2.default.GEOMETRY_TYPE.POINT];

  styles[_consts2.default.GEOMETRY_TYPE.GEOMETRY_COLLECTION] = styles[_consts2.default.GEOMETRY_TYPE.POLYGON].concat(styles[_consts2.default.GEOMETRY_TYPE.LINE_STRING], styles[_consts2.default.GEOMETRY_TYPE.POINT]);

  return styles;
}

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/extends");

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = require("lodash/fp/isEqual");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map