<script>
  import { Circle } from 'ol/geom'
  import GeometryType from 'ol/geom/GeometryType'
  import { get as getProj } from 'ol/proj'
  import { simpleGeometry } from '../../mixins'
  import { isPointCoords, roundPointCoords, transformDistance } from '../../ol-ext'
  import { assert, coalesce, constant, isEqual, isNumber, round } from '../../utils'

  export default {
    name: 'VlGeomCircle',
    mixins: [
      simpleGeometry,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      coordinates: {
        ...simpleGeometry.props.coordinates,
        validator: isPointCoords,
      },
      /* eslint-enable vue/require-prop-types */
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
    data () {
      return {
        currentRadiusViewProj: this.radius,
      }
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
      currentRadiusDataProj () {
        return this.radiusToDataProj(this.currentRadiusViewProj)
      },
    },
    watch: {
      radiusViewProj (value) {
        this.setRadius(value, true)
      },
      currentRadiusDataProj (value) {
        if (value === this.radiusDataProj) return

        this.$emit('update:radius', value)
      },
    },
    created () {
      this.currentRadiusViewProj = this.radiusViewProj
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
      getCoordinates (viewProj = false) {
        return this.getCenter(viewProj)
      },
      /**
       * @param {number[]} coordinate
       * @param {boolean} [viewProj=false]
       */
      setCoordinates (coordinate, viewProj = false) {
        this.setCenter(coordinate, viewProj)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {number[]}
       */
      getCenter (viewProj = false) {
        const center = coalesce(this.$geometry?.getCenter(), this.currentCoordinatesViewProj)

        return viewProj ? roundPointCoords(center) : this.pointToDataProj(center)
      },
      /**
       * @param {number[]} center
       * @param {boolean} [viewProj=false]
       */
      setCenter (center, viewProj = false) {
        assert(isPointCoords(center), 'Invalid center')
        center = viewProj ? roundPointCoords(center) : this.pointToViewProj(center)

        if (!isEqual(center, this.currentCoordinatesViewProj)) {
          this.currentCoordinatesViewProj = center
        }
        if (this.$geometry && !isEqual(center, this.$geometry.getCenter())) {
          this.$geometry.setCenter(center)
        }
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {number}
       */
      getRadius (viewProj = false) {
        const radius = coalesce(this.$geometry?.getRadius(), this.currentRadiusViewProj)

        return viewProj ? round(radius) : this.radiusToDataProj(radius)
      },
      /**
       * @param {number} radius
       * @param {boolean} [viewProj=false]
       */
      setRadius (radius, viewProj = false) {
        assert(isNumber(radius), 'Invalid radius')
        radius = viewProj ? round(radius) : this.radiusToDataProj(radius)

        if (radius !== this.currentRadiusViewProj) {
          this.currentRadiusViewProj = radius
        }
        if (this.$geometry && radius !== this.$geometry.getRadius()) {
          this.$geometry.setRadius(radius)
        }
      },
      /**
       * @param {number[]} center
       * @param {number} radius
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      setCenterAndRadius (center, radius, viewProj = false) {
        center = viewProj ? roundPointCoords(center) : this.pointToViewProj(center)
        radius = viewProj ? round(radius) : this.radiusToViewProj(radius)

        if (this.$geometry) {
          this.$geometry.setCenterAndRadius(center, radius)
        } else {
          this.setCenter(center, true)
          this.setRadius(radius, true)
        }
      },
      /**
       * @param {number} radius
       * @return {undefined|number}
       * @protected
       */
      radiusToViewProj (radius) {
        return transformDistance(radius, this.resolvedRadiusProjection, this.resolvedViewProjection)
      },
      /**
       * @param {number} radius
       * @return {undefined|number}
       * @protected
       */
      radiusToDataProj (radius) {
        return transformDistance(radius, this.resolvedViewProjection, this.resolvedRadiusProjection)
      },
    },
  }
</script>
