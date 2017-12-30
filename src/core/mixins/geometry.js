import { isEqual } from 'lodash/fp'
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged'
import { map as mapObs } from 'rxjs/operator/map'
import { throttleTime } from 'rxjs/operator/throttleTime'
import { EPSG_4326 } from '../'
import * as extentHelper from '../ol-ext/extent'
import * as projHelper from '../ol-ext/proj'
import observableFromOlEvent from '../rx-ext/from-ol-event'
import * as assert from '../utils/assert'
import mergeDescriptors from '../utils/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import useMapCmp from './use-map-cmp'

const props = {
  /**
   * Coordinates in provided projection.
   * @type {number[]|ol.Coordinate}
   */
  coordinates: {
    type: Array,
    required: true,
    validator: val => val.length,
  },
  /**
   * Coordinates projection.
   * @type {string}
   * @default EPSG:4326
   */
  projection: {
    type: String,
    default: EPSG_4326,
  },
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
    if (this.rev && this.$geometry) {
      return this.extentToSourceProj(this.$geometry.getExtent())
    }
  },
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
   * @throws {AssertionError}
   * @protected
   */
  init () {
    assert.hasView(this)
    // define helper methods based on geometry type
    const { transform } = projHelper.transforms[this.type]
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.toSourceProj = coordinates => transform(coordinates, this.$view.getProjection(), this.projection)
    /**
     * @method
     * @param {number[]} coordinates
     * @return {number[]}
     * @protected
     */
    this.fromSourceProj = coordinates => transform(coordinates, this.projection, this.$view.getProjection())
    /**
     * @param {number[]|ol.Extent} extent
     * @return {ol.Extent}
     * @protected
     */
    this.extentToSourceProj = extent => projHelper.transformExtent(extent, this.$view.getProjection(), this.projection)

    return this::cmp.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::cmp.methods.deinit()
  },
  /**
   * @return {Promise}
   */
  refresh () {
    return this::cmp.methods.refresh()
  },
  /**
   * @return {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return mergeDescriptors(this::cmp.methods.getServices(), {
      get geometry () { return vm.$geometry },
    })
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$geometryContainer && this.$geometryContainer.setGeometry(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$geometryContainer && this.$geometryContainer.setGeometry(undefined)
  },
  /**
   * @return {void}
   * @protected
   */
  subscribeAll () {
    this::subscribeToGeomChanges()
  },
}
const watch = {
  coordinates (value) {
    if (!this.$geometry) return

    let isEq = isEqualGeom({
      coordinates: value,
      extent: extentHelper.boundingExtent(value),
    }, {
      coordinates: this.toSourceProj(this.$geometry.getCoordinates()),
      extent: this.extent,
    })

    if (!isEq) {
      this.$geometry.setCoordinates(this.fromSourceProj(value))
    }
  },
}

export default {
  mixins: [cmp, useMapCmp],
  props,
  computed,
  watch,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    },
  },
  data () {
    return {
      rev: 1,
    }
  },
  created () {
    Object.defineProperties(this, {
      /**
       * @type {ol.geom.Geometry|undefined}
       */
      $geometry: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map,
      },
      $view: {
        enumerable: true,
        get: () => this.$services && this.$services.view,
      },
      $geometryContainer: {
        enumerable: true,
        get: () => this.$services && this.$services.geometryContainer,
      },
    })
  },
}

/**
 * @return {void}
 * @private
 */
function subscribeToGeomChanges () {
  assert.hasGeometry(this)

  const ft = 100
  const changes = observableFromOlEvent(
    this.$geometry,
    'change',
    () => ({
      coordinates: this.toSourceProj(this.$geometry.getCoordinates()),
      extent: this.extentToSourceProj(this.$geometry.getExtent()),
    })
  )::throttleTime(ft)
    ::distinctUntilChanged(isEqualGeom)
    ::mapObs(({ coordinates }) => ({
      prop: 'coordinates',
      value: coordinates,
    }))

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev
    this.$emit(`update:${prop}`, value)
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
