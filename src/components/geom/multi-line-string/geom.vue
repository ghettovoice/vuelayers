<script>
  import { constant } from 'lodash/fp'
  import MultiLineString from 'ol/geom/multilinestring'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_LINE_STRING)
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiLineString}
     * @protected
     */
    createGeometry () {
      return new MultiLineString(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-multi-line-string',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
