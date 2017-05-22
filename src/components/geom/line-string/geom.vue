<script>
  import { constant } from 'lodash/fp'
  import LineString from 'ol/geom/linestring'
  import { consts } from '../../../ol-ext'
  import geom from '../geom'

  const { GEOMETRY_TYPE } = consts

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const computed = {
    type: constant(GEOMETRY_TYPE.LINE_STRING)
  }

  const methods = {
    /**
     * @returns {ol.geom.LineString}
     * @protected
     */
    createGeometry () {
      return new LineString(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-line-string',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
