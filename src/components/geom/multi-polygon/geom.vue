<script>
  import { constant } from 'lodash/fp'
  import MultiPolygon from 'ol/geom/multipolygon'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POLYGON)
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiPolygon}
     * @protected
     */
    createGeometry () {
      return new MultiPolygon(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-polygon',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
