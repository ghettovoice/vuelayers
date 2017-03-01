<script>
  import ol from 'openlayers'
  import geom from 'vuelayers/src/mixins/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const methods = {
    createGeometry () {
      return new ol.geom.LineString(ol.proj.fromLonLat(this.coordinates, this.view.getProjection()))
    }
  }

  export default {
    name: 'vl-geom-line',
    mixins: [ geom ],
    props,
    methods
  }
</script>

<style>/* stub styles */</style>
