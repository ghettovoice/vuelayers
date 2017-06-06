<script>
  import { constant } from 'lodash/fp'
  import LineString from 'ol/geom/linestring'
  import { GEOMETRY_TYPE } from '../../../ol-ext'
  import geom from '../geom'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.LINE_STRING)
  }

  const methods = {
    /**
     * @returns {ol.geom.LineString}
     * @protected
     */
    createGeometry () {
      return new LineString(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-line-string',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
