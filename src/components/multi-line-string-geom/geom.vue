<script>
  import { constant } from 'lodash/fp'
  import MultiLineString from 'ol/geom/multilinestring'
  import { GEOMETRY_TYPE, geometry } from '../../core'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_LINE_STRING),
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiLineString}
     * @protected
     */
    createGeometry () {
      return new MultiLineString(this.toViewProj(this.coordinates))
    },
  }

  export default {
    name: 'vl-geom-multi-line-string',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
