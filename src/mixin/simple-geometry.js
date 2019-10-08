import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
import { makeWatchers } from 'util/vue-helpers'
import {
  boundingExtent,
  transforms,
} from '../ol-ext'
import { obsFromOlEvent } from '../rx-ext'
import { isEmpty, isEqual, negate, pick } from '../util/minilo'
import GeometryLayout from 'ol/geom/GeometryLayout'
import geometry from './geometry'

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
    /**
     * @type {string}
     */
    layout: {
      type: String,
      default: GeometryLayout.XY,
      validator: value => Object.values(GeometryLayout).includes(value.toUpperCase()),
    },
  },
  computed: {
    coordinatesViewProj () {
      if (!(this.rev && this.$geometry)) return

      return this.$geometry.getCoordinates()
    },
    layoutUCase () {
      return this.layout.toUpperCase()
    },
  },
  watch: {
    coordinates (value) {
      this.setCoordinates(value)
    },
    resolvedDataProjection () {
      this.setCoordinates(this.coordinates)
    },
    ...makeWatchers([
      'layoutUCase',
    ], () => geometry.methods.scheduleRecreate),
  },
  methods: {
    /**
     * @return {Promise<number[]>}
     */
    async getCoordinates () {
      const coordinates = (await this.resolveGeometry()).getCoordinates()

      return this.toDataProj(coordinates)
    },
    /**
     * @param {number[]} coordinates
     */
    async setCoordinates (coordinates) {
      // compares in data projection
      const isEq = isEqualGeom({
        coordinates,
        extent: boundingExtent(coordinates),
      }, {
        coordinates: await this.getCoordinates(),
        extent: this.extent,
      })

      if (isEq) return

      coordinates = await this.toViewProj(coordinates)
      const geom = await this.resolveGeometry()

      geom.setCoordinates(coordinates)
    },
    /**
     * @returns {number[]>}
     */
    async getFirstCoordinate () {
      const coordinate = (await this.resolveGeometry()).getFirstCoordinate()

      return this.pointToDataProj(coordinate)
    },
    /**
     * @returns {Promise<string>}
     */
    async getLayout () {
      return (await this.resolveGeometry()).getLayout()
    },
    /**
     * @returns {Promise<number[]>}
     */
    async getLastCoordinate () {
      const coordinate = (await this.resolveGeometry()).getLastCoordinate()

      return this.pointToDataProj(coordinate)
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
