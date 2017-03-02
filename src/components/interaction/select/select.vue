<script>
  import ol from 'openlayers'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vl-rx'
  import { errordbg } from 'vl-utils/debug'
  import interaction from 'vl-components/interaction/interaction'

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

  const interactionRefresh = interaction.methods.refresh

  const methods = {
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      const style = this.styles && this.styles.length
        ? () => this.styles
        : undefined

      return new ol.interaction.Select({
        multi: this.multi,
        filter: feature => !this.serviceOverlay.getSource().getFeatures().includes(feature),
        style
      })
    },
    getStyleTarget () {
      return {
        setStyle: this::setStyle,
        getStyle: this::getStyle
      }
    },
    refresh () {
      this.interaction.getFeatures().changed()
      this::interactionRefresh()
    },
    recreate () {
      this.interaction = this.createInteraction()
      this.interaction.vm = this
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

    if (this.interaction) {
      this.recreate()
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
