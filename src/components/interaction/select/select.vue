<script>
  import ol from 'openlayers'
  import { forEach, difference } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'vl-rx'
  import { errordbg } from 'vl-utils/debug'
  import { style as styleHelper } from 'vl-ol'
  import interaction from 'vl-components/interaction/interaction'
  import styleTarget, { createStyleFunc } from 'vl-components/style/target'

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
  const methods = {
    /**
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
    },
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      const defaultStyles = styleHelper.defaultEditStyle()
      const styleFunc = createStyleFunc(this)
      const style = function __selectStyleFunc (feature, resolution) {
        const styles = styleFunc(feature, resolution)
        if (styles === null || (Array.isArray(styles) && styles.length)) {
          return styles
        }

        return feature.getGeometry() != null
          ? defaultStyles[ feature.getGeometry().getType() ]
          : null
      }
      const serviceFeatures = this.serviceLayer() && this.serviceLayer().getSource().getFeatures()

      return new ol.interaction.Select({
        multi: this.multi,
        filter: feature => !serviceFeatures.includes(feature),
        style
      })
    },
    refresh () {
      this.interaction && this.interaction.getFeatures().changed()
      this::interactionRefresh()
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
    },
    styleTarget () {
      return this.interaction
    },
    setStyle (style) {
      this.styles = style
      this.refresh()
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

  const { provide: interactionProvide } = interaction
  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction, styleTarget ],
    inject: [ 'map', 'serviceLayer' ],
    props,
    methods,
    watch,
    provide () {
      return {
        ...this::interactionProvide(),
        ...this::styleTargetProvide()
      }
    },
    data () {
      return {
        currentSelected: this.selected.slice()
      }
    }
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
