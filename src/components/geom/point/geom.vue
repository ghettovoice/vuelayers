<script>
  import { constant } from 'lodash/fp'
  import Point from 'ol/geom/point'
  import { GEOMETRY_TYPE } from '../../../ol-ext'
  import geom from '../geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => value.length === 2
    }
  }

  const computed = {
    type: constant(GEOMETRY_TYPE.POINT)
  }

  const methods = {
    /**
     * @return {ol.geom.Point}
     * @protected
     */
    createGeom () {
      return new Point(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-point',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
