<script>
  import MultiPolygonGeom from 'ol/geom/multipolygon'
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
    type: constant(consts.GEOMETRY_TYPE.MULTI_POLYGON)
  }

  const methods = {
    createGeometry () {
      return new MultiPolygonGeom(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-polygon',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>

<style>/* stub styles */</style>
