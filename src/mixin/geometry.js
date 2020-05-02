import { map as mapObs, skipWhile } from 'rxjs/operators'
import { getGeometryId, initializeGeometry, roundExtent, setGeometryId } from '../ol-ext'
import { fromOlChangeEvent as obsFromOlChangeEvent, fromVueEvent as obsFromVueEvent } from '../rx-ext'
import { addPrefix, hasProp, isEqual, pick } from '../util/minilo'
import mergeDescriptors from '../util/multi-merge-descriptors'
import waitFor from '../util/wait-for'
import olCmp, { OlObjectEvent } from './ol-cmp'
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
  data () {
    return {
      dataProjection: null,
    }
  },
  computed: {
    type () {
      if (!(this.rev && this.$geometry)) return

      return this.$geometry.getType()
    },
    currentExtentDataProj () {
      if (!(this.rev && this.$geometry)) return

      return this.getExtentSync()
    },
    currentExtentViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.getExtentSync(null, true)
    },
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @returns {Promise<void>}
     * @protected
     */
    async beforeInit () {
      try {
        await waitFor(
          () => this.$mapVm != null,
          obsFromVueEvent(this.$eventBus, [
            OlObjectEvent.CREATE_ERROR,
          ]).pipe(
            mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
          ),
          1000,
        )
        this.dataProjection = this.$mapVm.resolvedDataProjection
        await this.$nextTickPromise()

        return this::olCmp.methods.beforeInit()
      } catch (err) {
        err.message = 'Wait for $mapVm injection: ' + err.message
        throw err
      }
    },
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
     * @returns {void}
     */
    subscribeAll () {
      this::olCmp.methods.subscribeAll()
      this::subscribeToGeometryEvents()
    },
    /**
     * @return {Promise<module:ol/geom/Geometry~Geometry>}
     */
    resolveGeometry: olCmp.methods.resolveOlObject,
    ...pick(olCmp.methods, [
      'init',
      'deinit',
      'beforeMount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'resolveOlObject',
    ]),
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
      if (id === await this.getId()) return

      setGeometryId(await this.resolveGeometry(), id)
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
      await this.resolveGeometry()

      return this.getExtentSync(extent)
    },
    getExtentSync (extent, viewProj = false) {
      if (viewProj) {
        return roundExtent(this.$geometry.getExtent(extent))
      }

      extent = extent != null ? this.extentToViewProj(extent) : null

      return this.extentToDataProj(this.$geometry.getExtent(extent))
    },
    /**
     * @param {number[]} point
     * @param {number[]} [closestPoint]
     * @returns {Promise<number[]>}
     */
    async getClosestPoint (point, closestPoint) {
      point = this.pointToViewProj(point)
      closestPoint = closestPoint != null ? this.pointToViewProj(closestPoint) : undefined

      return this.pointToDataProj((await this.resolveGeometry()).getClosestPoint(point, closestPoint))
    },
    /**
     * @param {number[]} coordinate
     * @returns {Promise<boolean>}
     */
    async isIntersectsCoordinate (coordinate) {
      return (await this.resolveGeometry()).intersectsCoordinate(this.pointToViewProj(coordinate))
    },
    /**
     * @param {number[]} extent
     * @returns {Promise<boolean>}
     */
    async isIntersectsExtent (extent) {
      return (await this.resolveGeometry()).intersectsExtent(this.extentToViewProj(extent))
    },
    /**
     * @param {number} angle Angle in radians
     * @param {number[]} anchor
     * @returns {Promise<void>}
     */
    async rotate (angle, anchor) {
      (await this.resolveGeometry()).rotate(angle, this.pointToViewProj(anchor))
    },
    /**
     * @param {number} sx
     * @param {number} [sy]
     * @param {number[]} [anchor]
     * @returns {Promise<void>}
     */
    async scale (sx, sy, anchor) {
      (await this.resolveGeometry()).scale(sx, sy, anchor && this.pointToViewProj(anchor))
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
      get: () => this.$services?.viewVm,
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
  const prefixKey = addPrefix('current')
  const propChanges = obsFromOlChangeEvent(this.$geometry, [
    'id',
  ], true, evt => ({
    ...evt,
    compareWith: this[prefixKey(evt.prop)],
  })).pipe(
    skipWhile(({ compareWith, value }) => isEqual(value, compareWith)),
  )
  this.subscribeTo(propChanges, () => {
    ++this.rev
  })
}
