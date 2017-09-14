<script>
  import { constant } from 'lodash/fp'
  import Polygon from 'ol/geom/polygon'
  import { ol as vlol, mixins } from '../../core'

  const { GEOMETRY_TYPE } = vlol
  const { geometry } = mixins

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
      return new Polygon(this.fromLonLat(this.coordinates))
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
