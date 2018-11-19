<script>
  import MultiLineString from 'ol/geom/MultiLineString'
  import geometry from '../../mixin/geometry'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { constant } from '../../util/minilo'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_LINE_STRING),
  }

  const methods = {
    /**
     * @returns {MultiLineString}
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
