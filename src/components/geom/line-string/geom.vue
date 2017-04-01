<script>
  import LineString from 'ol/geom/linestring'
  import { consts } from '../../../ol'
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
    type: () => GEOMETRY_TYPE.LINE_STRING
  }

  const methods = {
    createGeometry () {
      return new LineString(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-line-string',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>
