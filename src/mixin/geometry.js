import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
import {
  boundingExtent,
  findPointOnSurface,
  getGeometryId,
  initializeGeometry,
  setGeometryId,
  transforms,
} from '../ol-ext'
import { observableFromOlEvent } from '../rx-ext'
import { hasGeometry } from '../util/assert'
import { isEqual } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import cmp from './ol-virt-cmp'
import projTransforms from './proj-transforms'
import useMapCmp from './use-map-cmp'

export default {
  mixins: [cmp, useMapCmp, projTransforms],
  props: {
    /**
     * Coordinates in the map view projection.
     * @type {number[]}
     */
    coordinates: {
      type: Array,
      required: true,
      validator: val => val.length,
    },
  },
  computed: {
    /**
     * @type {string}
     * @abstract
     * @readonly
     */
    type () {
      throw new Error('Not implemented computed property')
    },
    /**
     * @type {number[]|undefined}
     */
    extent () {
      if (this.extentViewProj && this.resolvedDataProjection) {
        return this.extentToDataProj(this.extentViewProj)
      }
    },
    /**
     * @type {number[]|undefined}
     */
    extentViewProj () {
      if (this.rev && this.$geometry) {
        return this.$geometry.getExtent()
      }
    },
    /**
     * @type {number[]|undefined}
     */
    point () {
      if (this.pointViewProj && this.resolvedDataProjection) {
        return this.pointToDataProj(this.pointViewProj)
      }
    },
    /**
     * @type {number[]}
     */
    pointViewProj () {
      if (this.rev && this.$geometry) {
        return findPointOnSurface(this.$geometry)
      }
    },
    /**
     * @type {number[]|undefined}
     */
    coordinatesViewProj () {
      if (this.rev && this.$geometry) {
        return this.$geometry.getCoordinates()
      }
    },
  },
  methods: {
    /**
     * @return {module:ol/geom/Geometry~Geometry|Promise<module:ol/geom/Geometry~Geometry>}
     * @protected
     */
    async createOlObject () {
      const geometry = await this.createGeometry()

      initializeGeometry(geometry, this.id)

      return geometry
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|Promise<module:ol/geom/Geometry~Geometry>}
     * @protected
     * @abstract
     */
    createGeometry () {
      throw new Error('Not implemented method')
    },
    /**
     * @return {number[]}
     */
    getCoordinates () {
      hasGeometry(this)

      return this.toDataProj(this.$geometry.getCoordinates())
    },
    /**
     * @param {number[]} coordinates
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
       * @param {number[]} coordinates
       * @return {number[]}
       * @protected
       */
      this.toDataProj = coordinates => transform(coordinates, this.viewProjection, this.resolvedDataProjection)
      /**
       * @method
       * @param {number[]} coordinates
       * @return {number[]}
       * @protected
       */
      this.toViewProj = coordinates => transform(coordinates, this.resolvedDataProjection, this.viewProjection)
    },
    /**
     * @return {void|Promise}
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
  },
  watch: {
    id (value) {
      if (!this.$geometry || value === getGeometryId(this.$geometry)) {
        return
      }

      setGeometryId(this.$geometry, value)
    },
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

      if (isEq) return

      this.setCoordinates(value)
    },
    resolvedDataProjection () {
      if (!this.$geometry) return

      this.setupTransformFunctions()
      this.setCoordinates(this.coordinates)
    },
  },
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  created () {
    this::defineServices()
  },
}

function defineServices () {
  Object.defineProperties(this, {
    /**
     * @type {module:ol/geom/Geometry~Geometry|undefined}
     */
    $geometry: {
      enumerable: true,
      get: () => this.$olObject,
    },
    /**
     * @type {module:ol/PluggableMap~PluggableMap|undefined}
     */
    $map: {
      enumerable: true,
      get: () => this.$services && this.$services.map,
    },
    /**
     * @type {module:ol/View~View|undefined}
     */
    $view: {
      enumerable: true,
      get: () => this.$services && this.$services.view,
    },
    /**
     * @type {Object|undefined}
     */
    $geometryContainer: {
      enumerable: true,
      get: () => this.$services && this.$services.geometryContainer,
    },
  })
}

/**
 * @return {void}
 * @private
 */
function subscribeToGeomChanges () {
  hasGeometry(this)

  const ft = 1000 / 60
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

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
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
