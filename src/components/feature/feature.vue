<script>
  import uuid from 'node-uuid'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'

  const props = {
    id: {
      type: String,
      default: uuid.v4()
    }
  }

  export default {
    name: 'vl-feature',
    mixins: [ rxSubs ],
    props,
    render: h => h(),
    destroyed () {
      this.feature = undefined
    }
  }
</script>

<style>
  /* stub style  */
</style>
