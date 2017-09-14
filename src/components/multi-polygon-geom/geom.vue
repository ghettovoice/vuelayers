<script>
  import { constant } from 'lodash/fp'
  import MultiPolygon from 'ol/geom/multipolygon'
  import { ol as vlol, mixins } from '../../core'

  const { GEOMETRY_TYPE } = vlol
  const { geometry } = mixins

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POLYGON),
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiPolygon}
     * @protected
     */
    createGeometry () {
      return new MultiPolygon(this.fromLonLat(this.coordinates))
    },
  }

  export default {
    name: 'vl-geom-multi-polygon',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
