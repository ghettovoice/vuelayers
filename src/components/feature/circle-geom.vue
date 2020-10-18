<script>
  import debounce from 'debounce-promise'
  import { boundingExtent } from 'ol/extent'
  import { Circle } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { get as getProj } from 'ol/proj'
  import { FRAME_TIME, simpleGeometry } from '../../mixins'
  import { COORD_PRECISION, roundCoords, transformDistance, transformExtent, transformPoint } from '../../ol-ext'
  import { constant, isEqual, round } from '../../utils'
  import sequential from '../../utils/sequential'

  export default {
    name: 'VlGeomCircle',
    mixins: [
      simpleGeometry,
    ],
    props: {
      coordinates: {
        type: Array,
        required: true,
        validator: value => value.length === 2,
      },
      /**
       * Circle radius always in meters.
       * @type {number}
       */
      radius: {
        type: Number,
        default: 0,
      },
      /**
       * Projection in which radius provided.
       * Default: map data projection
       * @type {string}
       */
      radiusProjection: {
        type: String,
        validator: value => !!getProj(value),
      },
    },
    computed: {
      type: /*#__PURE__*/constant(GeometryType.CIRCLE),
      resolvedRadiusProjection () {
        return this.radiusProjection || this.resolvedDataProjection
      },
      radiusDataProj () {
        return round(this.radius)
      },
      radiusViewProj () {
        return this.radiusToViewProj(this.radius, this.coordinatesDataProj)
      },
      extentDataProj () {
        const center = transformPoint(
          this.coordinatesDataProj,
          this.resolvedDataProjection,
          this.resolvedRadiusProjection,
        )

        return transformExtent(boundingExtent([
          [center[0] - this.radiusDataProj, center[1] - this.radiusDataProj],
          [center[0] + this.radiusDataProj, center[1] + this.radiusDataProj],
        ]), this.resolvedRadiusProjection, this.resolvedDataProjection)
      },
      currentRadiusDataProj () {
        if (this.rev && this.$geometry) {
          return this.getRadiusInternal()
        }

        return this.radiusDataProj
      },
      currentRadiusViewProj () {
        if (this.rev && this.$geometry) {
          return this.getRadiusInternal(true)
        }

        return this.radiusViewProj
      },
      currentExtentDataProj () {
        const center = transformPoint(
          this.currentCoordinatesDataProj,
          this.resolvedDataProjection,
          this.resolvedRadiusProjection,
        )

        return transformExtent(boundingExtent([
          [center[0] - this.currentRadiusDataProj, center[1] - this.currentRadiusDataProj],
          [center[0] + this.currentRadiusDataProj, center[1] + this.currentRadiusDataProj],
        ]), this.resolvedRadiusProjection, this.resolvedDataProjection)
      },
      currentExtentViewProj () {
        return this.extentToViewProj(this.currentExtentDataProj)
      },
    },
    watch: {
      radiusViewProj: /*#__PURE__*/sequential(async function (value) {
        await this.setRadius(value, true)
      }),
      currentRadiusDataProj: /*#__PURE__*/debounce(function (value) {
        if (value === this.radiusDataProj) return

        this.$emit('update:radius', value)
      }, FRAME_TIME),
    },
    methods: {
      /**
       * @return {Circle}
       * @protected
       */
      createGeometry () {
        return new Circle(this.currentCoordinatesViewProj, this.currentRadiusViewProj)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {number[]}
       */
      getCoordinatesInternal (viewProj = false) {
        return this.getCenterInternal(viewProj)
      },
      /**
       * @param {number[]} coordinate
       * @param {boolean} [viewProj=false]
       * @protected
       */
      setCoordinatesInternal (coordinate, viewProj = false) {
        this.setCenterInternal(coordinate, viewProj)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>}
       */
      async getCenter (viewProj = false) {
        await this.resolveGeometry()

        return this.getCenterInternal(viewProj)
      },
      /**
       * @param {boolean} viewProj
       * @return {number[]}
       */
      getCenterInternal (viewProj = false) {
        if (viewProj) {
          return roundCoords(this.getTypeInternal(), this.$geometry.getCenter())
        }

        return this.pointToDataProj(this.$geometry.getCenter())
      },
      /**
       * @param {number[]} center
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async setCenter (center, viewProj = false) {
        await this.resolveGeometry()

        this.setCenterInternal(center, viewProj)
      },
      /**
       * @param {number[]} center
       * @param {boolean} [viewProj=false]
       */
      setCenterInternal (center, viewProj = false) {
        if (isEqual(center, this.getCenterInternal(viewProj))) return
        if (!viewProj) {
          center = this.pointToViewProj(center)
        }

        this.$geometry.setCenter(center)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {Promise<number>}
       */
      async getRadius (viewProj = false) {
        await this.resolveGeometry()

        return this.getRadiusInternal(viewProj)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {number}
       */
      getRadiusInternal (viewProj = false) {
        if (viewProj) {
          return round(this.$geometry.getRadius(), COORD_PRECISION)
        }

        return this.radiusToDataProj(this.$geometry.getRadius())
      },
      /**
       * @param {number} radius
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async setRadius (radius, viewProj = false) {
        if (radius === await this.getRadius(viewProj)) return
        if (!viewProj) {
          radius = this.radiusToViewProj(radius)
        }

        (await this.resolveGeometry()).setRadius(radius)
      },
      /**
       * @param {number[]} center
       * @param {number} radius
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async setCenterAndRadius (center, radius, viewProj = false) {
        if (
          radius === await this.getRadius(viewProj) &&
          isEqual(center, await this.getCenter(viewProj))
        ) return

        if (!viewProj) {
          center = this.pointToViewProj(center)
          radius = this.radiusToViewProj(radius)
        }

        (await this.resolveGeometry()).setCenterAndRadius(center, radius)
      },
      radiusToViewProj (radius) {
        return transformDistance(radius, this.resolvedRadiusProjection, this.resolvedViewProjection)
      },
      radiusToDataProj (radius) {
        return transformDistance(radius, this.resolvedViewProjection, this.resolvedRadiusProjection)
      },
    },
  }
</script>
