<script>
  import MultiLineString from 'ol/geom/multilinestring'
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
    type: () => GEOMETRY_TYPE.MULTI_LINE_STRING
  }

  const methods = {
    createGeometry () {
      return new MultiLineString(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-line-string',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>
