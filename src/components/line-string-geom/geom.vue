<script>
  import { constant } from 'lodash/fp'
  import LineString from 'ol/geom/linestring'
  import { GEOMETRY_TYPE, geometry } from '../../core'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.LINE_STRING),
  }

  const methods = {
    /**
     * @returns {ol.geom.LineString}
     * @protected
     */
    createGeometry () {
      return new LineString(this.coordinates)
    },
  }

  export default {
    name: 'vl-geom-line-string',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
