import { boundingExtent } from 'ol/extent'
// import GeometryLayout from 'ol/geom/GeometryLayout'
import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
import { transforms } from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { isEmpty, isEqual, negate, pick } from '../util/minilo'
// import { makeWatchers } from '../util/vue-helpers'
import geometry from './geometry'

/**
 * Base simple geometry with coordinates mixin.
 */
export default {
  mixins: [
    geometry,
  ],
  props: {
    // ol/geom/SimpleGeometry
    /**
     * @type {number[]} Coordinates in map data projection
     */
    coordinates: {
      type: Array,
      required: true,
      validator: negate(isEmpty),
    },
    // todo add support of coord layout
    // /**
    //  * @type {string}
    //  */
    // layout: {
    //   type: String,
    //   default: GeometryLayout.XY,
    //   validator: value => Object.values(GeometryLayout).includes(value.toUpperCase()),
    // },
  },
  computed: {
    coordinatesViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.$geometry.getCoordinates()
    },
    // layoutUpCase () {
    //   return this.layout.toUpperCase()
    // },
  },
  watch: {
    async coordinates (value) {
      await this.setGeometryCoordinates(value)
    },
    async resolvedDataProjection () {
      await this.setGeometryCoordinates(this.coordinates)
    },
    // ...makeWatchers([
    //   'layoutUpCase',
    // ], () => geometry.methods.scheduleRecreate),
  },
  methods: {
    /**
     * @return {Promise<number[]>}
     */
    async getGeometryCoordinates () {
      const coordinates = (await this.resolveGeometry()).getCoordinates()

      return this.coordinatesToDataProj(coordinates)
    },
    /**
     * @param {number[]} coordinates
     */
    async setGeometryCoordinates (coordinates) {
      // compares in data projection
      const isEq = isEqualGeom({
        coordinates,
        extent: boundingExtent(coordinates),
      }, {
        coordinates: await this.getGeometryCoordinates(),
        extent: this.extent,
      })

      if (isEq) return

      coordinates = await this.coordinatesToViewProj(coordinates)
      const geom = await this.resolveGeometry()

      geom.setCoordinates(coordinates)
    },
    /**
     * @returns {number[]>}
     */
    async getGeometryFirstCoordinate () {
      const coordinate = (await this.resolveGeometry()).getFirstCoordinate()

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getGeometryLastCoordinate () {
      const coordinate = (await this.resolveGeometry()).getLastCoordinate()

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<string>}
     */
    async getGeometryCoordinatesLayout () {
      return (await this.resolveGeometry()).getLayout()
    },
    /**
     * @return {Promise<void>}
     * @protected
     */
    subscribeAll () {
      return Promise.all(
        this::geometry.methods.subscribeAll(),
        this::subscribeToGeomChanges(),
      )
    },
    ...pick(geometry.methods, [
      'init',
      'deinit',
      'mount',
      'unmount',
      'refresh',
      'scheduleRefresh',
      'remount',
      'scheduleRemount',
      'recreate',
      'scheduleRecreate',
      'getServices',
    ]),
  },
}

/**
 * @return {Promise<void>}
 * @private
 */
async function subscribeToGeomChanges () {
  const geometry = await this.resolveGeometry()

  const ft = 1000 / 60
  const changes = obsFromOlEvent(
    geometry,
    'change',
    () => {
      const { transform } = transforms[geometry.getType()]

      return {
        coordinates: transform(geometry.getCoordinates(), this.viewProjection, this.resolvedDataProjection),
        extent: this.extent,
      }
    },
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
