import { EPSG_3857, getGeometryId, initializeGeometry, roundExtent, roundPointCoords, setGeometryId } from '../ol-ext'
import { coalesce, isEqual, mergeDescriptors } from '../utils'
import olCmp, { makeChangeOrRecreateWatchers } from './ol-cmp'
import projTransforms from './proj-transforms'
import stubVNode from './stub-vnode'
import waitForMap from './wait-for-map'

/**
 * Base geometry mixin.
 */
export default {
  mixins: [
    stubVNode,
    projTransforms,
    olCmp,
    waitForMap,
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
      extentViewProj: undefined,
    }
  },
  computed: {
    type () {
      if (!(this.rev && this.$geometry)) return

      return this.getType()
    },
    extentDataProj () {
      return this.extentToDataProj(this.extentViewProj)
    },
  },
  watch: {
    rev () {
      if (!this.$geometry) return

      if (!isEqual(this.extentViewProj, this.$geometry.getExtent())) {
        this.extentViewProj = this.$geometry.getExtent().slice()
      }
    },
    .../*#__PURE__*/makeChangeOrRecreateWatchers([
      'extentDataProj',
    ], [
      'extentDataProj',
    ]),
  },
  created () {
    this::defineServices()
  },
  methods: {
    /**
     * @return {Promise<void>}
     * @protected
     */
    async beforeInit () {
      await Promise.all([
        this::olCmp.methods.beforeInit(),
        this::waitForMap.methods.beforeInit(),
      ])
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
      throw new Error(`${this.vmName} not implemented method: createGeometry()`)
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async mount () {
      this.$geometryContainer?.setGeometry(this)

      return this::olCmp.methods.mount()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    async unmount () {
      if (this.$geometryContainer?.getGeometryVm() === this) {
        this.$geometryContainer.setGeometry(null)
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
     * @returns {string|number}
     */
    getIdInternal () {
      return getGeometryId(this.$geometry)
    },
    /**
     * @param {string|number} id
     */
    setIdInternal (id) {
      if (id === this.getIdInternal()) return

      setGeometryId(this.$geometry, id)
    },
    /**
     * @return {Promise<module:ol/geom/Geometry~Geometry>}
     */
    resolveGeometry: olCmp.methods.resolveOlObject,
    /**
     * @returns {string}
     */
    getType () {
      return coalesce(this.$geometry?.getType(), this.type)
    },
    /**
     * @param {boolean} [viewProj=false]
     * @returns {number[]}
     */
    getExtent (viewProj = false) {
      const extent = coalesce(this.$geometry?.getExtent(), this.extentViewProj)

      return viewProj ? roundExtent(extent) : this.extentToDataProj(extent)
    },
    /**
     * @param {number[]} point
     * @param {boolean} [viewProj=false]
     * @returns {Promise<number[]>}
     */
    async getClosestPoint (point, viewProj = false) {
      point = viewProj ? roundPointCoords(point) : this.pointToViewProj(point)
      const closestPoint = (await this.resolveGeometry()).getClosestPoint(point)

      return viewProj ? roundPointCoords(closestPoint) : this.pointToDataProj(closestPoint)
    },
    /**
     * @param {number[]} coordinate
     * @param {boolean} [viewProj=false]
     * @returns {Promise<boolean>}
     */
    async intersectsCoordinate (coordinate, viewProj = false) {
      coordinate = viewProj ? roundPointCoords(coordinate) : this.pointToViewProj(coordinate)

      return (await this.resolveGeometry()).intersectsCoordinate(coordinate)
    },
    /**
     * @param {number[]} extent
     * @param {boolean} [viewProj=false]
     * @returns {Promise<boolean>}
     */
    async intersectsExtent (extent, viewProj = false) {
      extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

      return (await this.resolveGeometry()).intersectsExtent(extent)
    },
    /**
     * @param {number} angle Angle in radians
     * @param {number[]} anchor
     * @param {boolean} [viewProj=false]
     * @returns {Promise<void>}
     */
    async rotate (angle, anchor, viewProj = false) {
      anchor = viewProj ? roundPointCoords(anchor) : this.pointToViewProj(anchor);

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
      anchor = viewProj ? roundPointCoords(anchor) : this.pointToViewProj(anchor);
      [sx] = viewProj ? roundPointCoords([sx, 0]) : this.pointToViewProj([sx, 0]);
      [, sy] = viewProj ? roundPointCoords([0, sy]) : this.pointToViewProj([0, sy]);

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
      [dx] = viewProj ? roundPointCoords([dx, 0]) : this.pointToViewProj([dx, 0]);
      [, dy] = viewProj ? roundPointCoords([0, dy]) : this.pointToViewProj([0, dy])

      return (await this.resolveGeometry()).translate(dx, dy)
    },
    /**
     * @param {number[]} value
     * @param {number[]} prev
     * @protected
     */
    extentDataProjChanged (value, prev) {
      if (isEqual(value, prev)) return

      this.$emit('update:extent', value?.slice())
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
}
