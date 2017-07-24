import { isEqual } from 'lodash/fp'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/throttleTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/map'
import '../../rx-ext'
import cmp from '../ol-virt-cmp'
import { extent as extentHelper, proj as projHelper } from '../../ol-ext'
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
    return this.geometry && this.extentToLonLat(this.geometry.getExtent())
  }
}

const methods = {
  /**
   * @return {ol.geometry.Geometry|Promise<ol.geometry.Geometry>}
   * @protected
   */
  createOlObject () {
    return this.createGeometry()
  },
  /**
   * @return {ol.geometry.Geometry|Promise<ol.geometry.Geometry>}
   * @protected
   * @abstract
   */
  createGeometry () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Promise}
   * @protected
   */
  init () {
    assert.hasView(this)
    // define helper methods based on geometry type
    const { toLonLat, fromLonLat } = projHelper.transforms[this.type]
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
    this.extentToLonLat = extent => projHelper.extentToLonLat(extent, this.view.getProjection())

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
      geometry: {
        enumerable: true,
        get: this.getGeometry
      },
      map: {
        enumerable: true,
        get: () => this.services && this.services.map
      },
      view: {
        enumerable: true,
        get: () => this.services && this.services.view
      }
    })
  },
  /**
   * @returns {ol.geometry.Geometry|undefined}
   */
  getGeometry () {
    return this.olObject
  },
  /**
   * @return {void}
   */
  refresh () {
    assert.hasGeometry(this)
    this.geometry.changed()
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return mergeDescriptors(this::cmp.methods.getServices(), {
      get geometry () { return vm.geometry }
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent && this.$parent.setGeometry(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$parent && this.$parent.setGeometry(undefined)
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
    if (!this.geometry) return

    let isEq = isEqualGeom({
      coordinates: value,
      extent: extentHelper.boundingExtent(value)
    }, {
      coordinates: this.toLonLat(this.geometry.getCoordinates()),
      extent: this.extent
    })

    if (!isEq) {
      this.geometry.setCoordinates(this.fromLonLat(value))
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
  assert.hasGeometry(this)

  const ft = 100
  const events = Observable.fromOlEvent(this.geometry, 'change', () => ({
    coordinates: this.toLonLat(this.geometry.getCoordinates()),
    extent: this.extentToLonLat(this.geometry.getExtent())
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
