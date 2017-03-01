<script>
  import ol from 'openlayers'
  import interaction from 'vuelayers/src/mixins/interaction/interaction'

  const props = {
    multi: {
      type: Boolean,
      default: false
    },
    wrapX: {
      type: Boolean,
      default: true
    }
  }

  const methods = {
    createInteraction () {
      return ol.interaction.Select({
        multi: this.multi,
        filter: feature => !this.serviceOverlay.getSource().getFeatures().includes(feature)
      })
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction ],
    props,
    methods
  }
</script>

<style>/* stub styles */</style>
