<script>
  import ol from 'openlayers'
  import geom from 'vl-components/geom/geom'
  import { coord as coordHelper } from 'vl-ol'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const methods = {
    createGeometry () {
      return new ol.geom.MultiPolygon(coordHelper.multiPolygonFromLonLat(this.coordinates, this.view.getProjection()))
    }
  }

  export default {
    name: 'vl-geom-multi-polygon',
    mixins: [ geom ],
    props,
    methods
  }
</script>

<style>/* stub styles */</style>
