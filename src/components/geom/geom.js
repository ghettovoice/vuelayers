import { isEqual } from 'lodash/fp'
import Observable from '../../rx-ext'
import rxSubs from '../rx-subs'
import stubVNode from '../stub-vnode'
import { coordHelper, extentHelper } from '../../ol-ext'
import { assertHasFeature, assertHasGeom, assertHasView } from '../../utils/assert'
import { SERVICE_CONTAINER_KEY } from '../../consts'

const { transforms } = coordHelper
const { toLonLat: extentToLonLat } = extentHelper

const props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true,
    validator: value => Array.isArray(value) && value.length
  }
}

const computed = {
  /**
   * @type {string}
   * @abstract
   * @readonly
   */
  type () {
    throw new Error('Not implemented computed property')
  }
}

const methods = {
  /**
   * @returns {ol.geom.Geometry|undefined}
   */
  getGeom () {
    return this._geom
  },
  /**
   * @return {void}
   */
  refresh () {
    assertHasGeom(this)
    this.geom.changed()
  },
  /**
   * @param {Object} opts
   * @return {void}
   */
  updateGeom (opts) {
    // todo use turf.js to optimize geometry compare
    if (opts.coordinates && !isEqual(opts.coordinates, this.currentCoordinates)) {
      this.geom.setCoordinates(this.fromLonLat(opts.coordinates))
    }
  },
  // protected & private
  /**
   * @return {ol.geom.Geometry}
   * @protected
   * @abstract
   */
  createGeom () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {void}
   * @protected
   */
  initialize () {
    // define helper methods based on geometry type
    const { toLonLat, fromLonLat } = transforms[this.type]
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.toLonLat = coordinates => toLonLat(coordinates, this.view.getProjection())
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.fromLonLat = coordinates => fromLonLat(coordinates, this.view.getProjection())
    /**
     * @method
     * @param {number[]} extent
     * @return {number[]}
     * @protected
     */
    this.extentToLonLat = extent => extentToLonLat(extent, this.view.getProjection())
    // create ol.geom.Geometry instance
    /**
     * @type {ol.geom.Geometry}
     * @protected
     */
    this._geom = this.createGeom()
    this._geom.set('vm', this)
    this::defineAccessors()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    assertHasFeature(this)
    assertHasGeom(this)

    this.feature.setGeometry(this.geom)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    assertHasFeature(this)

    this.unsubscribeAll()
    this.feature.setGeometry(undefined)
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToGeomChanges()
  }
}
const watch = {
  coordinates (coordinates) {
    assertHasGeom(this)
    assertHasView(this)
    this.updateGeom({ coordinates })
  }
}

export default {
  mixins: [rxSubs, stubVNode],
  props,
  computed,
  watch,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  inject: {
    serviceContainer: SERVICE_CONTAINER_KEY
  },
  /**
   * @returns {Object}
   */
  provide () {
    let vm = this

    return {
      [SERVICE_CONTAINER_KEY]: {
        get geom () { return vm.geom },
        get feature () { return vm.feature },
        get source () { return vm.source },
        get layer () { return vm.layer },
        get view () { return vm.view },
        get map () { return vm.map }
      }
    }
  },
  data () {
    return {
      currentCoordinates: this.coordinates.slice(),
      currentExtent: []
    }
  },
  created () {
    this.initialize()
    this.currentExtent = this.extentToLonLat(this.geom.getExtent())
  },
  mounted () {
    this.mount()
  },
  destroyed () {
    this.unmount()
    this._geom = undefined
  }
}

/**
 * @return {void}
 * @private
 */
function defineAccessors () {
  Object.defineProperties(this, {
    geom: {
      enumerable: true,
      get: this.getGeom
    },
    feature: {
      enumerable: true,
      get: () => this.serviceContainer.feature
    },
    source: {
      enumerable: true,
      get: () => this.serviceContainer.source
    },
    layer: {
      enumerable: true,
      get: () => this.serviceContainer.layer
    },
    view: {
      enumerable: true,
      get: () => this.serviceContainer.view
    },
    map: {
      enumerable: true,
      get: () => this.serviceContainer.map
    }
  })
}

/**
 * @return {void}
 * @private
 */
function subscribeToGeomChanges () {
  assertHasView(this)
  assertHasGeom(this)

  const geomChanges = Observable.fromOlEvent(this.geom, 'change')
    .throttleTime(60)
    .distinctUntilChanged((a, b) => isEqual(a, b))
    .map(() => ({
      coordinates: this.toLonLat(this.geom.getCoordinates())
    }))

  this.subscribeTo(geomChanges, ({ coordinates, extent }) => {
    if (!isEqual(this.currentCoordinates, coordinates)) {
      this.currentCoordinates = coordinates
      this.currentExtent = extentHelper.toLonLat(this.geom.getExtent(), this.view.getProjection())
    }

    this.$emit('change', { coordinates, extent })
  })
}
