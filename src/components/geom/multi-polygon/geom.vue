<script>
  import MultiPolygon from 'ol/geom/multipolygon'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const computed = {
    type: () => GEOMETRY_TYPE.MULTI_POLYGON
  }

  const methods = {
    createGeometry () {
      return new MultiPolygon(this.fromLonLat(this.currentCoordinates))
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
