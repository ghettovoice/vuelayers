<script>
  import LineString from 'ol/geom/LineString'
  import geometry from '../../mixin/geometry'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import { constant } from '../../util/minilo'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.LINE_STRING),
  }

  const methods = {
    /**
     * @returns {LineString}
     * @protected
     */
    createGeometry () {
      return new LineString(this.toViewProj(this.coordinates))
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
