<script>
  import { constant } from 'lodash/fp'
  import Polygon from 'ol/geom/polygon'
  import { GEOMETRY_TYPE, geometry } from '../../core'

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
      return new Polygon(this.fromBindProj(this.coordinates))
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
