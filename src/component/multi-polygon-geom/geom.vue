<script>
  import MultiPolygon from 'ol/geom/MultiPolygon'
  import { geometry } from '../../mixin'
  import { GEOMETRY_TYPE } from '../../ol-ext'
  import { constant } from '../../util/minilo'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POLYGON),
  }

  const methods = {
    /**
     * @returns {MultiPolygon}
     * @protected
     */
    createGeometry () {
      return new MultiPolygon(this.toViewProj(this.coordinates))
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
