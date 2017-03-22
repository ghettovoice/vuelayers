<script>
  import Point from 'ol/geom/point'
  import { GEOMETRY_TYPE } from 'vl-ol/consts'
  import geom from 'vl-components/geom/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length === 2
    }
  }

  const computed = {
    type: () => GEOMETRY_TYPE.POINT
  }

  const methods = {
    /**
     * @return {Point}
     * @protected
     */
    createGeometry () {
      return new Point(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-point',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>

<style>/* stub styles */</style>
