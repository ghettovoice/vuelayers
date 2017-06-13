import { isEqual } from 'lodash/fp'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import { Observable } from 'rxjs'
import '../../rx-ext'
import cmp from '../rx-subs'
import { extent, proj } from '../../ol-ext'
import * as assert from '../../utils/assert'

const props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true
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
   * @return {ol.geom.Geometry}
   * @protected
   */
  createOlObject () {
    let geom = this.createGeom()
    // initialize additional props
    this.currentExtent = this.extentToLonLat(geom.getExtent())
    return geom
  },
  /**
   * @return {ol.geom.Geometry}
   * @protected
   * @abstract
   */
  createGeom () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    // define helper methods based on geometry type
    const { toLonLat, fromLonLat } = proj.transforms[this.type]
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.toLonLat = coordinates => toLonLat(coordinates, this.map.view.getProjection())
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.fromLonLat = coordinates => fromLonLat(coordinates, this.map.view.getProjection())
    /**
     * @method
     * @param {number[]} extent
     * @return {number[]}
     * @protected
     */
    this.extentToLonLat = extent => proj.extentToLonLat(extent, this.map.view.getProjection())

    return this::cmp.methods.init()
  },
  /**
   * @return {void}
   * @protected
   */
  deinit () {
    this::cmp.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  defineAccessors () {
    Object.defineProperties(this, {
      geom: {
        enumerable: true,
        get: this.getGeom
      },
      map: {
        enumerable: true,
        get: () => this.services && this.services.map
      }
    })
  },
  /**
   * @returns {ol.geom.Geometry|undefined}
   */
  getGeom () {
    return this.olObject
  },
  /**
   * @return {void}
   */
  refresh () {
    assert.hasGeom(this)
    this.geom.changed()
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    return mergeDescriptors(this::cmp.methods.getServices(), {
      geom: this
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent.setGeometry(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$parent.setGeometry(undefined)
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToGeomChanges()
  },
  /**
   * @param {Object} opts
   * @return {void}
   * @protected
   */
  updateGeom (opts) {
    assert.hasGeom(this)

    if (opts.coordinates) {
      let isEq = isEqualGeom({
        coordinates: this.currentCoordinates,
        extent: this.currentExtent
      }, {
        coordinates: opts.coordinates,
        extent: extent.boundingExtent(opts.coordinates)
      })

      if (!isEq) {
        this.geom.setCoordinates(this.fromLonLat(opts.coordinates))
      }
    }
  }
}
const watch = {
  coordinates (coordinates) {
    this.updateGeom({ coordinates })
  }
}

export default {
  mixins: [cmp],
  props,
  computed,
  watch,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  data () {
    return {
      currentCoordinates: this.coordinates.slice(),
      currentExtent: []
    }
  }
}

/**
 * @return {void}
 * @private
 */
function subscribeToGeomChanges () {
  assert.hasMap(this)
  assert.hasGeom(this)

  const ft = 1000 / 30
  const geomChanges = Observable.fromOlEvent(
    this.geom,
    'change',
    () => ({
      coordinates: this.geom.getCoordinates(),
      extent: this.geom.getExtent()
    })
  ).throttleTime(ft)
    .distinctUntilChanged(isEqualGeom)
    .map(evt => ({
      ...evt,
      coordinates: this.toLonLat(evt.coordinates),
      extent: this.extentToLonLat(evt.extent)
    }))

  this.subscribeTo(geomChanges, ({ coordinates, extent }) => {
    this.currentCoordinates = coordinates
    this.currentExtent = extent

    this.$emit('change', {
      coordinates: this.currentCoordinates,
      extent: this.currentExtent
    })
  })
}

/**
 * @param {{coordinates: number[], extent: number[]}} a
 * @param {{coordinates: number[], extent: number[]}} b
 * @returns {boolean}
 */
function isEqualGeom (a, b) {
  return isEqual(a.extent, b.extent)
    ? isEqual(a.coordinates, b.coordinates)
    : false
}
