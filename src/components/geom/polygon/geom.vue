<script>
  import PolygonGeom from 'ol/geom/polygon'
  import { constant } from 'vl-utils/func'
  import { consts } from 'vl-ol'
  import geom from 'vl-components/geom/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const computed = {
    type: constant(consts.GEOMETRY_TYPE.POLYGON)
  }

  const methods = {
    createGeometry () {
      return new PolygonGeom(this.fromLonLat(this.currentCoordinates))
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
