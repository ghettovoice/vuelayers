<script>
  import Polygon from 'ol/geom/Polygon'
  import { geometry } from '../../mixin'
  import { GEOMETRY_TYPE } from '../../ol-ext'
  import { constant } from '../../util/minilo'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.POLYGON),
  }

  const methods = {
    /**
     * @returns {Polygon}
     * @protected
     */
    createGeometry () {
      return new Polygon(this.toViewProj(this.coordinates))
    },
  }

  export default {
    name: 'VlGeomPolygon',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
