<script>
  import ol from 'openlayers'
  import { flow, forEach, filter } from 'lodash/fp'
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

  const computed = {
    selectedIds () {
      return this.selected.map(f => f.id)
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
      this.rxSubs.select.unsubscribe()
      this.interaction = this.createInteraction()
      this.interaction.vm = this
      this::subscribeToSelect()
    },
    /**
     * @param {Object[]} features
     */
    select (features) {
      const selection = this.interaction.getFeatures()
      const layers = this.map.getLayers().getArray()
        .filter(layer => layer instanceof ol.layer.Vector && layer.vm)

      const pushFeatures = flow(
        filter(f => !this.selectedIds.includes(f.id)),
        forEach(f => {
          const layer = layers.find(layer => layer.vm.id === f.layer)

          if (layer) {
            selection.push(layer.getSource().getFeatureById(f.id))
          }
        })
      )

      pushFeatures(features)
      this.refresh()
    },
    /**
     * @param {Object[]} features
     */
    deselect (features) {
      const selection = this.interaction.getFeatures()
      const selectionArray = selection.getArray()
      console.log(selectionArray, features)
      features.forEach(f => {
        const idx = selectionArray.findIndex(feature => feature.getId() === f.id)

        if (idx !== -1) {
          selection.removeAt(idx)
        }
      })
      this.refresh()
    }
  }

  const watch = {
    selected () {
      this.$emit('select', this.selected)
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction ],
    props,
    computed,
    methods,
    watch,
    data () {
      return {
        selected: []
      }
    },
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
      .map(({ selected }) => selected.map(feature => feature.vm.plain))
      .subscribe(
        selected => {
          console.log(1)
          this.selected = selected
        },
        errordbg
      )
  }
</script>

<style>/* stub styles */</style>
