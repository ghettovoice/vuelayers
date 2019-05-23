<script>
  import Circle from 'ol/geom/Circle'
  import { geometry } from '../../mixin'
  import { GEOMETRY_TYPE } from '../../ol-ext'
  import { hasGeometry } from '../../util/assert'
  import { constant } from '../../util/minilo'

  /**
   * @alias module:circle-geom/geom
   * @title vl-geom-circle
   * @vueProto
   */
  export default {
    name: 'vl-geom-circle',
    mixins: [geometry],
    props: {
      coordinates: {
        type: Array,
        required: true,
        validator: value => value.length === 2,
      },
      radius: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      type: constant(GEOMETRY_TYPE.POINT),
      /**
       * @type {Array|undefined}
       */
      coordinatesViewProj () {
        if (this.rev && this.$geometry) {
          return this.$geometry.getCenter()
        }
      },
    },
    methods: {
      /**
       * @return {Circle}
       * @protected
       */
      createGeometry () {
        return new Circle(this.toViewProj(this.coordinates), this.radius)
      },
      /**
       * @return {Coordinate}
       */
      getCoordinates () {
        hasGeometry(this)

        return this.toDataProj(this.$geometry.getCenter())
      },
      /**
       * @param {Coordinate} coordinate
       */
      setCoordinates (coordinate) {
        hasGeometry(this)

        this.$geometry.setCenter(this.toViewProj(coordinate))
      },
    },
    watch: {
      radius (value) {
        if (!this.$geometry) return

        if (value !== this.$geometry.getRadius()) {
          this.$geometry.setRadius(value)
        }
      },
    },
  }
</script>
