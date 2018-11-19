<script>
  import MultiPoint from 'ol/geom/MultiPoint'
  import geometry from '../../mixin/geometry'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { constant } from '../../util/minilo'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POINT),
  }

  const methods = {
    /**
     * @returns {MultiPoint}
     * @protected
     */
    createGeometry () {
      return new MultiPoint(this.toViewProj(this.coordinates))
    },
  }

  export default {
    name: 'vl-geom-multi-point',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
