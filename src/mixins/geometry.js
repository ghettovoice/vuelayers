import { filter as filterObs, mapTo, skipWhile } from 'rxjs/operators'
import { EPSG_3857, getGeometryId, initializeGeometry, roundExtent, roundPointCoords, setGeometryId } from '../ol-ext'
import {
  fromOlChangeEvent as obsFromOlChangeEvent,
  fromVueEvent as obsFromVueEvent,
  fromVueWatcher as obsFromVueWatcher,
} from '../rx-ext'
import { addPrefix, assert, hasProp, isEqual, mergeDescriptors, pick, stubTrue, waitFor } from '../utils'
import olCmp, { isCreateError, OlObjectEvent } from './ol-cmp'
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
      viewProjection: EPSG_3857,
      dataProjection: EPSG_3857,
    }
  },
  computed: {
    type () {
      if (!(this.rev && this.$geometry)) return

      return this.getTypeInternal()
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
          obsFromVueEvent(this.$eventBus, OlObjectEvent.ERROR).pipe(
            filterObs(([err, vm]) => {
              return isCreateError(err) &&
                hasProp(vm, '$map') &&
                this.$vq.closest(vm)
            }),
            mapTo(stubTrue()),
          ),
        )
        this.viewProjection = this.$mapVm.resolvedViewProjection
        this.dataProjection = this.$mapVm.resolvedDataProjection
        this.subscribeTo(
          obsFromVueWatcher(this, () => this.$mapVm.resolvedViewProjection),
          ({ value }) => { this.viewProjection = value },
        )
        this.subscribeTo(
          obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection),
          ({ value }) => { this.dataProjection = value },
        )
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
      return initializeGeometry(await this.createGeometry(), this.currentId)
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
      if (this.$geometryContainer && this.$geometryContainer.getGeometryVm() === this) {
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
    .../*#__PURE__*/pick(olCmp.methods, [
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
     * @returns {string|number}
     */
    getIdInternal () {
      return getGeometryId(this.$geometry)
    },
    /**
     * @param {string|number} id
     * @returns {void}
     */
    setIdInternal (id) {
      assert(id != null && id !== '', 'Invalid geometry id')

      if (id === this.getIdInternal()) return

      setGeometryId(this.$geometry, id)
    },
    /**
     * @returns {Promise<string>}
     */
    async getType () {
      await this.resolveGeometry()

      return this.getTypeInternal()
    },
    /**
     * @return {string}
     * @protected
     */
    getTypeInternal () {
      return this.$geometry.getType()
    },
    /**
     * @param {number[]|undefined} [extent]
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]>}
     */
    async getExtent (extent, viewProj = false) {
      await this.resolveGeometry()

      return this.getExtentSync(extent, viewProj)
    },
    /**
     * @param {number[]|undefined} extent
     * @param {boolean} [viewProj=false]
     * @return {number[]}
     */
    getExtentSync (extent, viewProj = false) {
      if (viewProj) {
        return roundExtent(this.$geometry.getExtent(extent))
      }

      return this.extentToDataProj(this.$geometry.getExtent(this.extentToViewProj(extent)))
    },
    /**
     * @param {number[]} point
     * @param {number[]} [closestPoint]
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]>}
     */
    async getClosestPoint (point, closestPoint, viewProj = false) {
      if (viewProj) {
        return roundPointCoords((await this.resolveGeometry()).getClosestPoint(point, closestPoint))
      }

      return this.pointToDataProj((await this.resolveGeometry()).getClosestPoint(
        this.pointToViewProj(point),
        this.pointToViewProj(closestPoint),
      ))
    },
    /**
     * @param {number[]} coordinate
     * @param {boolean} [viewProj=false]
     * @returns {Promise<boolean>}
     */
    async intersectsCoordinate (coordinate, viewProj = false) {
      if (!viewProj) {
        coordinate = this.pointToViewProj(coordinate)
      }

      return (await this.resolveGeometry()).intersectsCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Promise<boolean>}
     */
    async intersectsExtent (extent, viewProj = false) {
      if (!viewProj) {
        extent = this.extentToViewProj(extent)
      }

      return (await this.resolveGeometry()).intersectsExtent(extent)
    },
    /**
     * @param {number} angle Angle in radians
     * @param {number[]} anchor
     * @param {boolean} [viewProj=false]
     * @returns {Promise<void>}
     */
    async rotate (angle, anchor, viewProj = false) {
      if (!viewProj) {
        anchor = this.pointToViewProj(anchor)
      }

      (await this.resolveGeometry()).rotate(angle, anchor)
    },
    /**
     * @param {number} sx
     * @param {number} [sy]
     * @param {number[]} [anchor]
     * @param {boolean} [viewProj=false]
     * @returns {Promise<void>}
     */
    async scale (sx, sy, anchor, viewProj = false) {
      if (!viewProj) {
        anchor = this.pointToViewProj(anchor);
        [sx] = this.pointToViewProj([sx, 0]);
        [, sy] = this.pointToViewProj([0, sy])
      }

      (await this.resolveGeometry()).scale(sx, sy, anchor)
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
     * @param {boolean} [viewProj=false]
     * @returns {Promise<*>}
     */
    async translate (dx, dy, viewProj = false) {
      if (!viewProj) {
        [dx] = this.pointToViewProj([dx, 0]);
        [, dy] = this.pointToViewProj([0, dy])
      }

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
