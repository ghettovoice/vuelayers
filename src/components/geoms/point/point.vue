<script>
  import geom from 'vuelayers/src/mixins/geom'

  const props = {
    coordinates: {
      type: Array,
      required: true,
      validator: value => Array.isArray(value) && value.length === 2
    }
  }

  export default {
    name: 'vl-point-geom',
    mixins: [ geom ],
    props
  }
</script>

<style>
  /* stub styles */
</style>
