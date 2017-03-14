<script>
  import ol, { style as styleHelper } from 'vl-ol'
  import Observable from 'vl-rx'
  import { forEach, constant, diffById } from 'vl-utils/func'
  import { errordbg } from 'vl-utils/debug'
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
    },
    filter: {
      type: Function,
      default: constant(true)
    }
  }

  const computed = {
    selectedIds () {
      return this.currentSelected.map(feature => feature.id)
    }
  }

  const {
    refresh: interactionRefresh,
    mountInteraction: interactionMountInteraction,
    unmountInteraction: interactionUnmountInteraction
  } = interaction.methods
  const defaultStyles = styleHelper.defaultEditStyle()

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
      // define default select style, will be used by styleTarget style function
      this.defaultStyles = function __selectDefaultStyleFunc (feature) {
        if (feature.getGeometry()) {
          return defaultStyles[ feature.getGeometry().getType() ]
        }
      }
      const style = createStyleFunc(this)

      const filterFunc = this.filter
      const filter = function __selectFilter (feature, layer) {
        return filterFunc(feature.plain(), layer && layer.id)
      }

      return new ol.interaction.Select({
        multi: this.multi,
        wrapX: this.wrapX,
        filter,
        style
      })
    },
    refresh () {
      this.interaction && this.interaction.getFeatures().changed()
      this::interactionRefresh()
    },
    /**
     * @param {Object} plainFeature
     * @param {string|number} plainFeature.id
     */
    select ({ id }) {
      if (!this.map || this.selectedIds.includes(id)) return

      const selection = this.interaction.getFeatures()
      let feature

      if (id) {
        const layers = this.map.getLayers()
          .getArray()
          .filter(layer => layer instanceof ol.layer.Vector)

        forEach(layer => {
          feature = layer.getSource().getFeatureById(id)
          return !feature
        }, layers)
      }

      feature && selection.push(feature)
    },
    /**
     * @param {Object} plainFeature
     * @param {string|number} plainFeature.id
     */
    unselect ({ id }) {
      if (!this.map || !this.selectedIds.includes(id)) return

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
    },
    mountInteraction () {
      this::interactionMountInteraction()
      this.currentSelected.forEach(this.select)
    },
    unmountInteraction () {
      this.currentSelected.forEach(this.unselect)
      this::interactionUnmountInteraction()
    }
  }

  const watch = {
    selected (selected) {
      let forSelect = diffById(selected, this.currentSelected)
      let forUnselect = diffById(this.currentSelected, selected)

      forSelect.forEach(this.select)
      forUnselect.forEach(this.unselect)
    }
  }

  const { provide: interactionProvide } = interaction
  const { provide: styleTargetProvide } = styleTarget

  export default {
    name: 'vl-interaction-select',
    mixins: [ interaction, styleTarget ],
    inject: [ 'map' ],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.$options.name
        }
      }
    },
    provide () {
      return Object.assign(this::interactionProvide(), this::styleTargetProvide())
    },
    data () {
      return {
        currentSelected: this.selected.slice()
      }
    }
  }

  function subscribeToInteractionChanges () {
    const selection = this.interaction.getFeatures()

    this.rxSubs.select = Observable.fromOlEvent(selection, 'add', evt => evt.element.plain())
      .subscribe(
        feature => {
          this.currentSelected.push(feature)
          this.$emit('select', feature)
        },
        err => errordbg(err.stack)
      )
    this.rxSubs.unselect = Observable.fromOlEvent(selection, 'remove', evt => evt.element.plain())
      .subscribe(
        feature => {
          this.currentSelected = this.currentSelected.filter(({ id }) => id !== feature.id)
          this.$emit('unselect', feature)
        },
        err => errordbg(err.stack)
      )
  }
</script>

<style>/* stub styles */</style>
