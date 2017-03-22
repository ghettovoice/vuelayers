<script>
  import SelectInteraction from 'ol/interaction/select'
  import VectorLayer from 'ol/layer/vector'
  import { Observable } from 'rxjs/Observable'
  import 'vl-rx/from-ol-event'
  import { forEach, differenceWith } from 'lodash/fp'
  import { defaultEditStyle } from 'vl-ol/style'
  import { write } from 'vl-ol/geojson'
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
  const defaultStyles = defaultEditStyle()

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

      const filterFunc = this.filter
      const filter = function __selectFilter (feature, layer) {
        return filterFunc(write(feature, this.view.getProjection()), layer && layer.get('id'))
      }

      return new SelectInteraction({
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
    inject: [ 'map', 'view' ],
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
        ({ element }) => write(element, this.view.getProjection())
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
        ({ element }) => write(element, this.view.getProjection())
      ),
      feature => {
        this.currentSelected = this.currentSelected.filter(({ id }) => id !== feature.id)
        this.$emit('unselect', feature)
      }
    )
  }
</script>

<style>/* stub styles */</style>
