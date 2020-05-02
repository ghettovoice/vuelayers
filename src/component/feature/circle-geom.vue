<script>
  import debounce from 'debounce-promise'
  import { boundingExtent } from 'ol/extent'
  import { Circle } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { get as getProj } from 'ol/proj'
  import { FRAME_TIME, simpleGeometry } from '../../mixin'
  import {
    COORD_PRECISION,
    roundCoords, transformDistance,
    transformExtent,
    transformPoint,
  } from '../../ol-ext'
  import { constant, isEqual, round } from '../../util/minilo'

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
      type: constant(GeometryType.CIRCLE),
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
        const center = transformPoint(this.coordinatesDataProj, this.resolvedDataProjection, this.resolvedRadiusProjection)

        return transformExtent(boundingExtent([
          [center[0] - this.radiusDataProj, center[1] - this.radiusDataProj],
          [center[0] + this.radiusDataProj, center[1] + this.radiusDataProj],
        ]), this.resolvedRadiusProjection, this.resolvedDataProjection)
      },
      currentRadiusDataProj () {
        if (this.rev && this.$geometry) {
          return this.getRadiusSync()
        }

        return this.radiusDataProj
      },
      currentRadiusViewProj () {
        if (this.rev && this.$geometry) {
          return this.getRadiusSync(true)
        }

        return this.radiusViewProj
      },
      currentExtentDataProj () {
        const center = transformPoint(this.currentCoordinatesDataProj, this.resolvedDataProjection, this.resolvedRadiusProjection)

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
      async radiusDataProj (value) {
        await this.setRadius(value)
      },
      currentRadiusDataProj: debounce(function (value) {
        if (value === this.radiusDataProj) return

        this.$emit('update:radius', value)
      }, FRAME_TIME),
      async resolvedRadiusProjection () {
        await this.setRadius(this.radiusDataProj)
      },
    },
    methods: {
      /**
       * @return {Circle}
       * @protected
       */
      createGeometry () {
        return new Circle(this.currentCoordinatesViewProj, this.currentRadiusViewProj)
      },
      getCoordinatesSync () {
        return this.getCenterSync()
      },
      setCoordinatesSync (coordinate) {
        this.setCenterSync(coordinate)
      },
      async getCenter () {
        await this.resolveGeometry()

        return this.getCenterSync()
      },
      getCenterSync (viewProj = false) {
        if (viewProj) {
          return roundCoords(this.$geometry.getType(), this.$geometry.getCenter())
        }

        return this.pointToDataProj(this.$geometry.getCenter())
      },
      async setCenter (center) {
        await this.resolveGeometry()

        this.setCenterSync(center)
      },
      setCenterSync (center) {
        if (isEqual(center, this.getCenterSync())) return

        this.$geometry.setCenter(this.pointToViewProj(center))
      },
      async getRadius () {
        await this.resolveGeometry()

        return this.getRadiusSync()
      },
      getRadiusSync (viewProj = false) {
        if (viewProj) {
          return round(this.$geometry.getRadius(), COORD_PRECISION)
        }

        return this.radiusToDataProj(this.$geometry.getRadius(), this.$geometry.getCenter())
      },
      async setRadius (radius) {
        await this.resolveGeometry()

        this.setRadiusSync(radius)
      },
      setRadiusSync (radius) {
        if (radius === this.getRadiusSync()) return

        this.$geometry.setRadius(this.radiusToViewProj(radius, this.getCenterSync()))
      },
      async setCenterAndRadius (center, radius) {
        await this.resolveGeometry()

        this.setCenterAndRadiusSync(center, radius)
      },
      setCenterAndRadiusSync (center, radius) {
        if (
          radius === this.getRadiusSync() &&
          isEqual(center, this.getCenterSync())
        ) return

        this.$geometry.setCenterAndRadius(
          this.pointToViewProj(center),
          this.radiusToViewProj(radius, center),
        )
      },
      radiusToViewProj (radius, center) {
        return transformDistance(radius, this.resolvedRadiusProjection, this.viewProjection)
      },
      radiusToDataProj (radius, center) {
        return transformDistance(radius, this.viewProjection, this.resolvedRadiusProjection)
      },
    },
  }
</script>
