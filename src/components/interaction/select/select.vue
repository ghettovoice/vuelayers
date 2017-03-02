<script>
  import ol from 'openlayers'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vuelayers/src/rx'
  import { errordbg } from 'vuelayers/src/utils/debug'
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
      return new ol.interaction.Select({
        multi: this.multi,
        filter: feature => !this.serviceOverlay.getSource().getFeatures().includes(feature)
      })
    },
    getStyleTarget () {
      return {
        setStyle: this::setStyle,
        getStyle: this::getStyle
      }
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction ],
    props,
    methods,
    created () {
      this::subscribeToSelect()
    }
  }

  function setStyle (style) {
    this.styles = style

    if (this.layer) {
      this.layer.setStyle((feature, resolution) => {
        // todo implement conditions on vl-style-container
        return this.styles
      })
      this.refresh()
    }
  }

  function getStyle () {
    return this.styles || []
  }

  function subscribeToSelect () {
    this.rxSubs.select = Observable.fromOlEvent(this.interaction, 'select')
      .throttleTime(100)
      .map(({ selected, deselected }) => ({
        selected: selected.map(feature => feature.vm),
        deselected: deselected.map(feature => feature.vm)
      }))
      .subscribe(
        ({ selected, deselected }) => {
          selected = selected.map(vm => {
            vm.selected = true
            return vm.plain
          })
          deselected = deselected.map(vm => {
            vm.selected = false
            return vm.plain
          })
          this.$emit('select', selected, deselected)
        },
        errordbg
      )
  }
</script>

<style>/* stub styles */</style>
