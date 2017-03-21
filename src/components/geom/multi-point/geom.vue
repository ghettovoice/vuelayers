<script>
  import MultiPointGeom from 'ol/geom/multipoint'
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
    type: constant(consts.GEOMETRY_TYPE.MULTI_POINT)
  }

  const methods = {
    createGeometry () {
      return new MultiPointGeom(this.fromLonLat(this.currentCoordinates))
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
