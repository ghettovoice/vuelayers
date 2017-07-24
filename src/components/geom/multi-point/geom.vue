<script>
  import { constant } from 'lodash/fp'
  import MultiPoint from 'ol/geom/multipoint'
  import { GEOMETRY_TYPE } from '../../../ol-ext'
  import geom from '../geom'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POINT)
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiPoint}
     * @protected
     */
    createGeometry () {
      return new MultiPoint(this.fromLonLat(this.coordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-point',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
