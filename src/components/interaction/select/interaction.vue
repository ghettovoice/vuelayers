<script>
  import Vue from 'vue'
  import SelectInteraction from 'ol/interaction/select'
  import VectorLayer from 'ol/layer/vector'
  import Feature from 'ol/feature'
  import { forEach, mapValues, differenceWith, isPlainObject } from 'lodash/fp'
  import Observable from '../../../rx-ext'
  import { styleHelper, geoJson } from '../../../ol-ext'
  import interaction from '../interaction'
  import styleTarget, { createStyleFunc } from '../../style-target'
  import { assertHasInteraction, assertHasMap } from '../../../utils/assert'
  import plainProps from '../../../utils/plain-props'

  // todo add other options, like event modifiers
  const props = {
    filter: {
      type: Function,
      default: () => true
    },
    hitTolerance: Number, // default 0
    multi: Boolean, // default false
    selected: {
      type: Array,
      default: () => []
    },
    wrapX: Boolean // default true
  }

  const computed = {
    /**
     * @type {Array}
     */
    selectedIds () {
      return this.currentSelected.map(f => f.id)
    }
  }

  const defaultStyles = mapValues(styleHelper.style, styleHelper.defaultEditStyle())

  const methods = {
    /**
     * @return {void}
     */
    refresh () {
      assertHasInteraction(this)
      this.interaction.getFeatures().changed()
      this::interaction.methods.refresh()
    },
    /**
     * @param {GeoJSONFeature|Vue|ol.Feature} feature
     * @return {void}
     */
    select (feature) {
      assertHasMap(this)
      assertHasInteraction(this)

      let id
      if (isPlainObject(feature)) {
        id = feature.id
      } else if (feature instanceof Vue) {
        id = feature.id
        feature = feature.feature
      } else if (feature instanceof Feature) {
        id = feature.getId()
      } else {
        throw new Error('Illegal first argument')
      }
      // skip if already added
      if (this.selectedIds.includes(id)) return

      const selection = this.interaction.getFeatures()

      if (!(feature instanceof Feature)) {
        if (!id) throw new Error('Undefined feature id')

        const layers = this.map.map.getLayers().getArray()

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
     * @param {GeoJSONFeature|Vue|ol.Feature} feature
     * @return {void}
     */
    unselect (feature) {
      assertHasInteraction(this)

      let id
      if (isPlainObject(feature)) {
        id = feature.id
      } else if (feature instanceof Vue) {
        id = feature.id
        feature = feature.feature
      } else if (feature instanceof Feature) {
        id = feature.getId()
      } else {
        throw new Error('Illegal first argument')
      }

      if (!this.selectedIds.includes(id)) return

      const selection = this.interaction.getFeatures()
      const selectionArray = selection.getArray()
      const idx = selectionArray.findIndex(f => f.id === id)

      if (idx !== -1) {
        selection.removeAt(idx)
      }
    },
    /**
     * Removes all features from selection.
     * @return {void}
     */
    unselectAll () {
      assertHasInteraction(this)
      this.interaction.getFeatures().clear()
    },
    // protected & private
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      const vm = this
      const style = createStyleFunc(this)
      const filter = function __selectFilter (feature, layer) {
        assertHasMap(vm)

        return vm.filter(
          geoJson.writeFeature(feature, vm.map.view.getProjection()),
          layer && plainProps(layer.getProperties())
        )
      }

      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter,
        style
      })
    },
    /**
     * @return {ol.StyleFunction}
     * @protected
     */
    getDefaultStyles () {
      return function __selectDefaultStyleFunc (feature) {
        if (feature.getGeometry()) {
          return defaultStyles[feature.getGeometry().getType()]
        }
      }
    },
    /**
     * @return {ol.interaction.Interaction}
     * @protected
     */
    getStyleTarget () {
      return this.interaction
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::interaction.method.mount()
      this.currentSelected.forEach(this.select)
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unselectAll()
      this::interaction.methods.unmount()
    },
    /**
     * @param {*} style
     * @return {void}
     * @protected
     */
    setStyle (style) {
      this::styleTarget.methods.setStyle(style)
      this.refresh()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
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

  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, styleTarget],
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
    data () {
      return {
        currentSelected: this.selected.slice()
      }
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    assertHasMap(this)
    assertHasInteraction(this)

    const selection = this.interaction.getFeatures()
    // select event
    this.subscribeTo(
      Observable.fromOlEvent(
        selection,
        'add',
        ({ element }) => geoJson.writeFeature(element, this.map.view.getProjection())
      ),
      feature => {
        this.currentSelected.push(feature)
        this.$emit('select', feature)
      }
    )
    // unselect event
    this.subscribeTo(
      Observable.fromOlEvent(
        selection,
        'remove',
        ({ element }) => geoJson.writeFeature(element, this.map.view.getProjection())
      ),
      feature => {
        let idx = this.currentSelected.findIndex(({ id }) => id === feature.id)
        this.currentSelected.splice(idx, 1)
        this.$emit('unselect', feature)
      }
    )
  }
</script>
