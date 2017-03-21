<script>
  import LineStringGeom from 'ol/geom/linestring'
  import { constant } from 'lodash/fp'
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
    type: constant(consts.GEOMETRY_TYPE.LINE_STRING)
  }

  const methods = {
    createGeometry () {
      return new LineStringGeom(this.fromLonLat(this.currentCoordinates))
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

<style>/* stub styles */</style>
