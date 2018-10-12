import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
import { boundingExtent } from '../ol-ext/extent'
import { findPointOnSurface } from '../ol-ext/geom'
import { transforms } from '../ol-ext/proj'
import observableFromOlEvent from '../rx-ext/from-ol-event'
import { hasGeometry } from '../util/assert'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import projTransforms from './proj-transforms'
import useMapCmp from './use-map-cmp'

const props = {
  /**
   * Coordinates in the map view projection.
   * @type {number[]|Coordinate}
   */
  coordinates: {
    type: Array,
    required: true,
    validator: val => val.length,
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
  /**
   * @type {number[]|Extent|undefined}
   */
  extent () {
    if (this.extentViewProj && this.resolvedDataProjection) {
      return this.extentToDataProj(this.extentViewProj)
    }
  },
  /**
   * @type {number[]|Extent|undefined}
   */
  extentViewProj () {
    if (this.rev && this.$geometry) {
      return this.$geometry.getExtent()
    }
  },
  /**
   * @type {number[]|Coordinate|undefined}
   */
  point () {
    if (this.pointViewProj && this.resolvedDataProjection) {
      return this.pointToDataProj(this.pointViewProj)
    }
  },
  /**
   * @type {Array<number>}
   */
  pointViewProj () {
    if (this.rev && this.$geometry) {
      return findPointOnSurface(this.$geometry)
    }
  },
  /**
   * @type {Array|undefined}
   */
  coordinatesViewProj () {
    if (this.rev && this.$geometry) {
      return this.$geometry.getCoordinates()
    }
  },
}

const methods = {
  /**
   * @return {Geometry|Promise<Geometry>}
   * @protected
   */
  createOlObject () {
    return this.createGeometry()
  },
  /**
   * @return {Geometry|Promise<Geometry>}
   * @protected
   * @abstract
   */
  createGeometry () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {Coordinate}
   */
  getCoordinates () {
    hasGeometry(this)
    return this.toDataProj(this.$geometry.getCoordinates())
  },
  /**
   * @param {Coordinate} coordinates
   */
  setCoordinates (coordinates) {
    hasGeometry(this)
    this.$geometry.setCoordinates(this.toViewProj(coordinates))
  },
  /**
   * @return {Promise}
   * @throws {AssertionError}
   * @protected
   */
  init () {
    this.setupTransformFunctions()

    return this::cmp.methods.init()
  },
  /**
   * @protected
   */
  setupTransformFunctions () {
    // define helper methods based on geometry type
    const { transform } = transforms[this.type]
    /**
     * @method
     * @param {Array} coordinates
     * @return {number[]}
     * @protected
     */
    this.toDataProj = coordinates => transform(coordinates, this.viewProjection, this.resolvedDataProjection)
    /**
     * @method
     * @param {Array} coordinates
     * @return {number[]}
     * @protected
     */
    this.toViewProj = coordinates => transform(coordinates, this.resolvedDataProjection, this.viewProjection)
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
    if (!this.$geometry || !this.$view) return

    // compares in data projection
    let isEq = isEqualGeom({
      coordinates: value,
      extent: boundingExtent(value),
    }, {
      coordinates: this.getCoordinates(),
      extent: this.extent,
    })

    if (!isEq) {
      this.setCoordinates(value)
    }
  },
  resolvedDataProjection () {
    if (this.$geometry) {
      this.setupTransformFunctions()
      this.setCoordinates(this.coordinates)
    }
  },
}

export default {
  mixins: [cmp, useMapCmp, projTransforms],
  props,
  computed,
  watch,
  methods,
  stubVNode: {
    empty () {
      return this.$options.name
    },
  },
  created () {
    Object.defineProperties(this, {
      /**
       * @type {Geometry|undefined}
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
  hasGeometry(this)

  const ft = 100
  const changes = observableFromOlEvent(
    this.$geometry,
    'change',
    () => ({
      coordinates: this.getCoordinates(),
      extent: this.extent,
    }),
  ).pipe(
    throttleTime(ft),
    distinctUntilChanged(isEqualGeom),
    mapObs(({ coordinates }) => ({
      prop: 'coordinates',
      value: coordinates,
    })),
  )

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
