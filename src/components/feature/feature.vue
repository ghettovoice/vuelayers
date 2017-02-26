<script>
  import rxSubs from 'vuelayers/src/mixins/rx-subs'

  export default {
    name: 'vl-feature',
    mixins: [ rxSubs ],
    render: h => h(),
    beforeDestroy () {
      this.feature = undefined
    }
  }
</script>
