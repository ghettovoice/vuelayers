<script>
  import Circle from 'ol/geom/Circle'
  import geometry from '../../mixin/geometry'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { hasGeometry } from '../../util/assert'
  import { constant } from '../../util/minilo'

  /**
   * @vueProps
   */
  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => value.length === 2,
    },
    radius: {
      type: Number,
      default: 0,
    },
  }

  /**
   * @vueComputed
   */
  const computed = {
    type: constant(GEOMETRY_TYPE.POINT),
    /**
     * @type {Array|undefined}
     */
    coordinatesViewProj () {
      if (this.rev && this.$geometry) {
        return this.$geometry.getCenter()
      }
    },
  }

  /**
   * @vueMethods
   */
  const methods = {
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
  }

  const watch = {
    radius (value) {
      if (!this.$geometry) return

      if (value !== this.$geometry.getRadius()) {
        this.$geometry.setRadius(value)
      }
    },
  }

  /**
   * @alias module:circle-geom/geom
   * @title vl-geom-circle
   * @vueProto
   */
  export default {
    name: 'vl-geom-circle',
    mixins: [geometry],
    props,
    computed,
    methods,
    watch,
  }
</script>
