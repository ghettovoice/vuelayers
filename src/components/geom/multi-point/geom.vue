<script>
  import { constant } from 'lodash/fp'
  import MultiPoint from 'ol/geom/multipoint'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

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
      return new MultiPoint(this.fromLonLat(this.currentCoordinates))
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
