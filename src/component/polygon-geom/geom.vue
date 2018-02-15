<script>
  /**
   * @module polygon-geom/geom
   */
  import { constant } from 'lodash/fp'
  import Polygon from 'ol/geom/polygon'
  import { GEOMETRY_TYPE } from '../../ol-ext/consts'
  import geometry from '../../mixin/geometry'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.POLYGON),
  }

  const methods = {
    /**
     * @returns {ol.geom.Polygon}
     * @protected
     */
    createGeometry () {
      return new Polygon(this.toViewProj(this.coordinates))
    },
  }

  export default {
    name: 'vl-geom-polygon',
    mixins: [geometry],
    props,
    computed,
    methods,
  }
</script>
