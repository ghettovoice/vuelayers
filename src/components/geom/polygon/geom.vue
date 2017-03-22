<script>
  import Polygon from 'ol/geom/polygon'
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
    type: () => GEOMETRY_TYPE.POLYGON
  }

  const methods = {
    createGeometry () {
      return new Polygon(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-polygon',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>

<style>/* stub styles */</style>
