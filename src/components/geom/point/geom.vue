<script>
  import ol from 'openlayers'
  import geom from 'vuelayers/src/mixins/geom'
  import { coord as coordHelper } from 'vuelayers/src/ol'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length === 2
    }
  }

  const methods = {
    /**
     * @return {ol.geom.Point}
     * @protected
     */
    createGeometry () {
      return new ol.geom.Point(coordHelper.pointFromLonLat(this.coordinates, this.view.getProjection()))
    }
  }

  export default {
    name: 'vl-geom-point',
    mixins: [ geom ],
    props,
    methods
  }
</script>

<style>
  /* stub styles */
</style>
