<script>
  import MultiPoint from 'ol/geom/multipoint'
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
