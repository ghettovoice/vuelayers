<script>
  import Point from 'ol/geom/point'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length === 2
    }
  }

  const computed = {
    type: () => GEOMETRY_TYPE.POINT
  }

  const methods = {
    /**
     * @return {Point}
     * @protected
     */
    createGeometry () {
      return new Point(this.fromLonLat(this.currentCoordinates))
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
