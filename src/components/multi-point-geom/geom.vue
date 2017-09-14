<script>
  import { constant } from 'lodash/fp'
  import MultiPoint from 'ol/geom/multipoint'
  import { ol as vlol, mixins } from '../../core'

  const { GEOMETRY_TYPE } = vlol
  const { geometry } = mixins

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_POINT),
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiPoint}
     * @protected
     */
    createGeometry () {
      return new MultiPoint(this.fromLonLat(this.coordinates))
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
