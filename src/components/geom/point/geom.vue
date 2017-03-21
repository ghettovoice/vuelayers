<script>
  import PointGeom from 'ol/geom/point'
  import { constant } from 'vl-utils/func'
  import { consts } from 'vl-ol'
  import geom from 'vl-components/geom/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length === 2
    }
  }

  const computed = {
    type: constant(consts.GEOMETRY_TYPE.POINT)
  }

  const methods = {
    /**
     * @return {Point}
     * @protected
     */
    createGeometry () {
      return new PointGeom(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-point',
    mixins: [ geom ],
    props,
    computed,
    methods
  }
</script>

<style>/* stub styles */</style>
