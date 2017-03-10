<script>
  import ol, { coord as coordHelper } from 'vl-ol'
  import geom from 'vl-components/geom/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length
    }
  }

  const methods = {
    createGeometry () {
      return new ol.geom.MultiLineString(coordHelper.multiLineFromLonLat(this.coordinates, this.view().getProjection()))
    }
  }

  export default {
    name: 'vl-geom-multi-line-string',
    mixins: [ geom ],
    props,
    methods
  }
</script>

<style>/* stub styles */</style>
