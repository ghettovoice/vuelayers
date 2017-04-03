<script>
  import SelectInteraction from 'ol/interaction/select'
  import VectorLayer from 'ol/layer/vector'
  import { forEach, mapValues, differenceWith } from 'lodash/fp'
  import Observable from '../../../rx'
  import plainProps from '../../../utils/plain-props'
  import { styleHelper, geoJson } from '../../../ol'
  import interaction from '../interaction'
  import { styleTarget, createStyleFunc } from '../../style'

  const { style, defaultEditStyle } = styleHelper

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
      default: () => true
    }
  }

  const computed = {
    selectedIds () {
      return this.currentSelected.map(x => x.id)
    }
  }

  const {
    refresh: interactionRefresh,
    mountInteraction: interactionMountInteraction,
    unmountInteraction: interactionUnmountInteraction
  } = interaction.methods
  const defaultStyles = mapValues(style, defaultEditStyle())

  const methods = {
    /**
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
    },
    /**
     * @return {SelectInteraction}
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
      const view = this.view
      const filterFunc = this.filter
      const filter = function __selectFilter (feature, layer) {
        return filterFunc(geoJson.writeFeature(feature, view.getProjection()), layer && plainProps(layer.getProperties()))
      }

      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter,
        style
      })
    },
    refresh () {
      this.interaction.getFeatures().changed()
      this::interactionRefresh()
    },
    /**
     * @param {Object} geoJsonFeature
     * @param {string|number} geoJsonFeature.id
     */
    select ({ id }) {
      if (!this.map || this.selectedIds.includes(id)) return

      const selection = this.interaction.getFeatures()
      let feature

      if (id) {
        const layers = this.map.getLayers().getArray()

        forEach(layer => {
          if (layer instanceof VectorLayer) {
            feature = layer.getSource().getFeatureById(id)
          }
          return !feature
        }, layers)
      }

      feature && selection.push(feature)
    },
    /**
     * @param {Object} geoJsonFeature
     * @param {string|number} geoJsonFeature.id
     */
    unselect ({ id }) {
      if (!this.map || !this.selectedIds.includes(id)) return

      const selection = this.interaction.getFeatures()
      const selectionArray = selection.getArray()
      const idx = selectionArray.findIndex(x => x.id === id)

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
      this.interaction && this.refresh()
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

  const diffById = differenceWith((a, b) => a.id === b.id)
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

    this.subscribeTo(
      Observable.fromOlEvent(
        selection,
        'add',
        ({ element }) => geoJson.writeFeature(element, this.view.getProjection())
      ),
      feature => {
        this.currentSelected.push(feature)
        this.$emit('select', feature)
      }
    )
    this.subscribeTo(
      Observable.fromOlEvent(
        selection,
        'remove',
        ({ element }) => geoJson.writeFeature(element, this.view.getProjection())
      ),
      feature => {
        this.currentSelected = this.currentSelected.filter(({ id }) => id !== feature.id)
        this.$emit('unselect', feature)
      }
    )
  }
</script>

<style>/* stub styles */</style>
