import { isEqual } from 'lodash/fp'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/map'
import '../../rx-ext'
import cmp from '../ol-virt-cmp'
import { extent, proj } from '../../ol-ext'
import * as assert from '../../utils/assert'

const props = {
  /**
   * Coordinates in EPSG:4326
   */
  coordinates: {
    type: Array,
    required: true,
    validator: val => val.length
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
  },
  extent () {
    return this.geom && this.extentToLonLat(this.geom.getExtent())
  }
}

const methods = {
  /**
   * @return {ol.geom.Geometry|Promise<ol.geom.Geometry>}
   * @protected
   */
  createOlObject () {
    return this.createGeom()
  },
  /**
   * @return {ol.geom.Geometry|Promise<ol.geom.Geometry>}
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
  }
}
const watch = {
  coordinates (value) {
    assert.hasGeom(this)

    let isEq = isEqualGeom({
      coordinates: value,
      extent: extent.boundingExtent(value)
    }, {
      coordinates: this.toLonLat(this.geom.getCoordinates()),
      extent: this.extent
    })

    if (!isEq) {
      this.geom.setCoordinates(this.fromLonLat(value))
    }
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
  }
}

/**
 * @return {void}
 * @private
 */
function subscribeToGeomChanges () {
  assert.hasMap(this)
  assert.hasGeom(this)

  const ft = 100
  const events = Observable.fromOlEvent(this.geom, 'change', () => ({
    coordinates: this.toLonLat(this.geom.getCoordinates()),
    extent: this.extentToLonLat(this.geom.getExtent())
  })).throttleTime(ft)
    .distinctUntilChanged(isEqualGeom)
    .map(({ coordinates }) => ({
      name: 'update:coordinates',
      value: coordinates
    }))

  this.subscribeTo(events, ({ name, value }) => this.$emit(name, value))
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
