<script>
  import { constant } from 'lodash/fp'
  import Polygon from 'ol/geom/polygon'
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
    type: constant(GEOMETRY_TYPE.POLYGON)
  }

  const methods = {
    /**
     * @returns {ol.geom.Polygon}
     * @protected
     */
    createGeometry () {
      return new Polygon(this.fromLonLat(this.currentCoordinates))
    }
  }

  export default {
    name: 'vl-geom-polygon',
    mixins: [geom],
    props,
    computed,
    methods
  }
</script>
