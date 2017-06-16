<script>
  import { constant } from 'lodash/fp'
  import MultiLineString from 'ol/geom/multilinestring'
  import { GEOMETRY_TYPE } from '../../../ol-ext'
  import geom from '../geom'

  const props = {}

  const computed = {
    type: constant(GEOMETRY_TYPE.MULTI_LINE_STRING)
  }

  const methods = {
    /**
     * @returns {ol.geom.MultiLineString}
     * @protected
     */
    createGeom () {
      return new MultiLineString(this.fromLonLat(this.coordinates))
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
