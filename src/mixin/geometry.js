import { findPointOnSurface, getGeometryId, initializeGeometry, setGeometryId, transforms } from '../ol-ext'
import { obsFromOlChangeEvent } from '../rx-ext'
import { pick, waitFor } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import olCmp from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'

/**
 * Base geometry mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    olCmp,
  ],
  stubVNode: {
    empty () {
      return this.vmId
    },
  },
  computed: {
    /**
     * @returns {string|undefined}
     */
    type () {
      if (!(this.rev && this.$geometry)) return

      return this.$geometry.getType()
    },
    /**
     * @returns {number[]|undefined}
     */
    extent () {
      if (!(this.extentViewProj && this.resolvedDataProjection)) return

      return this.extentToDataProj(this.extentViewProj)
    },
    /**
     * @returns {number[]|undefined}
     */
    extentViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.$geometry.getExtent()
    },
    /**
     * @returns {number[]|undefined}
     */
    point () {
      if (!(this.pointViewProj && this.resolvedDataProjection)) return

      return this.pointToDataProj(this.pointViewProj)
    },
    /**
     * @returns {number[]|undefined}
     */
    pointViewProj () {
      if (!(this.rev && this.$geometry)) return

      return findPointOnSurface(this.$geometry)
    },
  },
  watch: {
    async id (value) {
      await this.setId(value)
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<module:ol/geom/Geometry~Geometry>}
     * @protected
     */
    async createOlObject () {
      return initializeGeometry(await this.createGeometry(), this.id)
    },
    /**
     * @return {module:ol/geom/Geometry~Geometry|Promise<module:ol/geom/Geometry~Geometry>}
     * @protected
     * @abstract
     */
    createGeometry () {
      throw new Error('Not implemented method: createGeometry')
    },
    /**
     * @returns {Promise<string|number>}
     */
    async getId () {
      return getGeometryId(await this.resolveGeometry())
    },
    /**
     * @param {string|number} id
     * @returns {Promise<void>}
     */
    async setId (id) {
      const geometry = await this.resolveGeometry()

      if (id === getGeometryId(geometry)) return

      setGeometryId(geometry, id)
    },
    /**
     * @returns {Promise<string>}
     */
    async getType () {
      return (await this.resolveGeometry()).getType()
    },
    /**
     * @param {number[]} [extent]
     * @returns {Promise<number[]>}
     */
    async getExtent (extent) {
      extent = extent != null ? this.extentToViewProj(extent) : undefined

      return (await this.resolveGeometry()).getExtent(extent)
    },
    /**
     * @param {number[]} point
     * @param {number[]} [closestPoint]
     * @returns {Promise<number[]>}
     */
    async getClosestPoint (point, closestPoint) {
      point = this.pointToViewProj(point)
      closestPoint = closestPoint != null ? this.pointToViewProj(closestPoint) : undefined

      return (await this.resolveGeometry()).getClosestPoint(point, closestPoint)
    },
    /**
     * @param {number[]} coordinate
     * @returns {Promise<boolean>}
     */
    async isIntersectsCoordinate (coordinate) {
      coordinate = this.pointToViewProj(coordinate)

      return (await this.resolveGeometry()).intersectsCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<boolean>}
     */
    async isIntersectsExtent (extent) {
      extent = this.extentToViewProj(extent)

      return (await this.resolveGeometry()).intersectsExtent(extent)
    },
    /**
     * @param {number} angle Angle in radians
     * @param {number[]} anchor
     * @returns {Promise<void>}
     */
    async rotate (angle, anchor) {
      const geom = await this.resolveGeometry()
      anchor = this.pointToViewProj(anchor)

      geom.rotate(angle, anchor)
    },
    /**
     * @param {number} sx
     * @param {number} [sy]
     * @param {number[]} [anchor]
     * @returns {Promise<void>}
     */
    async scale (sx, sy, anchor) {
      const geom = await this.resolveGeometry()
      anchor = anchor != null ? this.pointToViewProj(anchor) : undefined

      geom.scale(sx, sy, anchor)
    },
    /**
     * @param {number} tolerance
     * @returns {Promise<module:ol/geom/Geometry~Geometry>}
     */
    async simplify (tolerance) {
      return (await this.resolveGeometry()).simplify(tolerance)
    },
    /**
     * @param dx
     * @param dy
     * @returns {Promise<*>}
     */
    async translate (dx, dy) {
      return (await this.resolveGeometry()).translate(dx, dy)
    },
    /**
     * @returns {Promise<function>}
     */
    async getCoordinatesTransformFunction () {
      const { transform } = transforms[await this.getType()]

      return transform
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    async coordinatesToDataProj (coordinates) {
      const transform = await this.getCoordinatesTransformFunction()

      return transform(coordinates, this.viewProjection, this.resolvedDataProjection)
    },
    /**
     * @param {number[]} coordinates
     * @returns {Promise<number[]>}
     */
    async coordinatesToViewProj (coordinates) {
      const transform = await this.getCoordinatesTransformFunction()

      return transform(coordinates, this.viewProjection, this.resolvedDataProjection)
    },
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async init () {
      await waitFor(() => this.$mapVm != null)

      return this::olCmp.methods.init()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      if (this.$geometryContainer) {
        await this.$geometryContainer.setGeometry(this)
      }

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$geometryContainer) {
        await this.$geometryContainer.setGeometry(null)
      }

      return this::olCmp.methods.unmount()
    },
    /**
     * @return {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::olCmp.methods.getServices(),
        {
          get geometryVm () { return vm },
        },
      )
    },
    /**
     * @returns {Promise<void>}
     */
    async subscribeAll () {
      await Promise.all(
        this::olCmp.methods.subscribeAll(),
        this::subscribeToGeometryEvents(),
      )
    },
    /**
     * @return {Promise<module:ol/geom/Geometry~Geometry>}
     */
    resolveGeometry: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'deinit',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
    ]),
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
     * @type {Object|undefined}
     */
    $mapVm: {
      enumerable: true,
      get: () => this.$services?.mapVm,
    },
    /**
     * @type {Object|undefined}
     */
    $viewVm: {
      enumerable: true,
      get: () => this.$services?.$viewVm,
    },
    /**
     * @type {Object|undefined}
     */
    $geometryContainer: {
      enumerable: true,
      get: () => this.$services?.geometryContainer,
    },
  })
}

async function subscribeToGeometryEvents () {
  const geometry = await this.resolveGeometry()

  const changes = obsFromOlChangeEvent(geometry, [
    'id',
  ], true, 1000 / 60)

  this.subscribeTo(changes, ({ prop, value }) => {
    ++this.rev

    this.$nextTick(() => {
      this.$emit(`update:${prop}`, value)
    })
  })
}
