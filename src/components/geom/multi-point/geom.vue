<script>
  import MultiPoint from 'ol/geom/multipoint'
  import { GEOMETRY_TYPE } from 'vl-ol/consts'
  import geom from 'vl-components/geom/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const computed = {
    type: () => GEOMETRY_TYPE.MULTI_POINT
  }

  const methods = {
    createGeometry () {
      return new MultiPoint(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-point',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>

<style>/* stub styles */</style>
