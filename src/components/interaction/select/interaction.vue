<script>
  import Vue from 'vue'
  import SelectInteraction from 'ol/interaction/select'
  import VectorLayer from 'ol/layer/vector'
  import Feature from 'ol/feature'
  import { forEach, mapValues, difference, isPlainObject, isNumber, isString } from 'lodash/fp'
  import Observable from '../../../rx-ext'
  import { style as styleHelper } from '../../../ol-ext'
  import interaction from '../interaction'
  import styleTarget, { createStyleFunc } from '../../style-target'
  import { assertHasInteraction, assertHasMap } from '../../../utils/assert'

  // todo add other options, like event modifiers
  const props = {
    filter: {
      type: Function,
      default: () => true
    },
    hitTolerance: {
      type: Number,
      default: 0
    },
    multi: {
      type: Boolean,
      default: false
    },
    /**
     * @type {number[]} Array of ids
     */
    selected: {
      type: Array,
      default: () => []
    },
    wrapX: {
      type: Boolean,
      default: true
    }
  }

  const defaultStyles = mapValues(styleHelper.style, styleHelper.defaultEditStyle())

  const methods = {
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      const filter = this.filter

      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter: function __selectFilter (feature, layer) {
          return filter(feature.getId(), layer && layer.get('id'))
        },
        style: createStyleFunc(this)
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
     * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
     * @return {void}
     * @throws {Error}
     */
    select (feature) {
      assertHasMap(this)
      assertHasInteraction(this)

      let id = extractId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.feature
      }

      const selection = this.interaction.getFeatures()
      // skip if already added
      const selectedIds = selection.getArray().map(f => f.getId())
      if (selectedIds.includes(id)) return

      if (!(feature instanceof Feature)) {
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
     * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
     * @return {void}
     */
    unselect (feature) {
      assertHasInteraction(this)

      let id = extractId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.feature
      }

      const selection = this.interaction.getFeatures()
      // skip if already added
      const selectedIds = selection.getArray().map(f => f.getId())
      if (!selectedIds.includes(id)) return

      const idx = selectedIds.findIndex(x => x === id)

      if (idx !== -1) {
        selection.removeAt(idx)
      }
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
     */
    refresh () {
      assertHasInteraction(this)
      this.interaction.getFeatures().changed()
      this::interaction.methods.refresh()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToInteractionChanges()
    },
    /**
     * Removes all features from selection.
     * @return {void}
     */
    unselectAll () {
      assertHasInteraction(this)
      this.interaction.getFeatures().clear()
    }
  }

  const watch = {
    selected (selected) {
      let forSelect = difference(selected, this.currentSelected)
      let forUnselect = difference(this.currentSelected, selected)

      forSelect.forEach(this.select)
      forUnselect.forEach(this.unselect)
    }
  }

  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, styleTarget],
    props,
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
        ({ element }) => element.getId()
      ),
      id => {
        if (!this.currentSelected.includes(id)) {
          this.currentSelected.push(id)
          this.$emit('select', { id })
        }
      }
    )
    // unselect event
    this.subscribeTo(
      Observable.fromOlEvent(
        selection,
        'remove',
        ({ element }) => element.getId()
      ),
      id => {
        let idx = this.currentSelected.findIndex(x => x === id)
        if (idx !== -1) {
          this.currentSelected.splice(idx, 1)
          this.$emit('unselect', { id })
        }
      }
    )
  }

  /**
   * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
   * @return {string|number}
   * @throws {Error}
   */
  function extractId (feature) {
    let id
    if (isPlainObject(feature) || feature instanceof Vue) {
      id = feature.id
    } else if (feature instanceof Feature) {
      id = feature.getId()
    } else if (isString(feature) || isNumber(feature)) {
      id = feature
    } else {
      throw new Error('Illegal feature format')
    }

    return id
  }
</script>
