<script>
  import ol from 'openlayers'
  import geom from 'vuelayers/src/mixins/geom'
  import { coord as coordHelper } from 'vuelayers/src/ol'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const methods = {
    createGeometry () {
      return new ol.geom.Polygon(coordHelper.polygonFromLonLat(this.coordinates, this.view.getProjection()))
    }
  }

  export default {
    name: 'vl-geom-polygon',
    mixins: [ geom ],
    props,
    methods
  }
</script>

<style>
  /* stub styles */
</style>
