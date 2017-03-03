<script>
  import ol from 'openlayers'
  import { forEach, difference } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'vl-rx'
  import { errordbg } from 'vl-utils/debug'
  import interaction from 'vl-components/interaction/interaction'

  // todo add other options, like event modifiers
  const props = {
    multi: {
      type: Boolean,
      default: false
    },
    wrapX: {
      type: Boolean,
      default: true
    },
    selected: {
      type: Array,
      default: () => []
    }
  }

  const interactionRefresh = interaction.methods.refresh
  const interactionInitialize = interaction.methods.initialize
  const methods = {
    /**
     * @protected
     */
    initialize () {
      this::interactionInitialize()
      this::subscribeToInteractionChanges()
    },
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      const style = this.styles && this.styles.length
        ? () => this.styles
        : undefined
      const serviceFeatures = this.serviceOverlay().getSource().getFeatures()

      return new ol.interaction.Select({
        multi: this.multi,
        filter: feature => !serviceFeatures.includes(feature),
        style
      })
    },
    refresh () {
      this.interaction.getFeatures().changed()
      this::interactionRefresh()
    },
    /**
     * @private
     */
    recreate () {
      this.unsubscribeAll()
      this.initialize()
    },
    /**
     * @param {number} id
     */
    select (id) {
      const selection = this.interaction.getFeatures()
      const layers = this.map().getLayers()
        .getArray()
        .filter(layer => layer.$vm && layer instanceof ol.layer.Vector)

      if (this.currentSelected.includes(id)) return

      let feature
      forEach(layer => {
        feature = layer.getSource().getFeatureById(id)
        return !feature
      }, layers)

      feature && selection.push(feature)
    },
    /**
     * @param {number} id
     */
    unselect (id) {
      const selection = this.interaction.getFeatures()
      const selectionArray = selection.getArray()
      const idx = selectionArray.findIndex(feature => feature.getId() === id)

      if (idx !== -1) {
        selection.removeAt(idx)
      }
    },
    unselectAll () {
      this.interaction.getFeatures().clear()
    }
  }

  const watch = {
    selected (selected) {
      let forSelect = difference(selected, this.currentSelected)
      let forUnselect = difference(this.currentSelected, selected)

      forSelect.forEach(id => this.select(id))
      forUnselect.forEach(id => this.unselect(id))
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction ],
    inject: [ 'map', 'serviceOverlay' ],
    props,
    methods,
    watch,
    provide () {
      return {
        setStyle: this::setStyle,
        getStyle: this::getStyle
      }
    },
    data () {
      return {
        currentSelected: this.selected.slice()
      }
    }
  }

  function setStyle (style) {
    this.styles = style

    if (this.interaction) {
      this.recreate()
    }
  }

  function getStyle () {
    return this.styles || []
  }

  function subscribeToInteractionChanges () {
    const selection = this.interaction.getFeatures()

    this.rxSubs.select = Observable.fromOlEvent(selection, 'add', evt => evt.element)
      .subscribe(
        feature => {
          this.currentSelected.push(feature.getId())
          this.$emit('select', feature.getId())
        },
        errordbg
      )
    this.rxSubs.unselect = Observable.fromOlEvent(selection, 'remove', evt => evt.element)
      .subscribe(
        feature => {
          this.currentSelected = this.currentSelected.filter(x => x !== feature.getId())
          this.$emit('unselect', feature.getId())
        },
        errordbg
      )
  }
</script>

<style>/* stub styles */</style>
