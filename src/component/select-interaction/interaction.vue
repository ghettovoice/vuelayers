<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :features="features"/>
  </i>
</template>

<script>
  /**
   * @module select-interaction/interaction
   */
  import Feature from 'ol/feature'
  import SelectInteraction from 'ol/interaction/select'
  import Vue from 'vue'
  import interaction from '../../mixin/interaction'
  import stylesContainer from '../../mixin/styles-container'
  import { getId as getFeatureId } from '../../ol-ext/feature'
  import { writeFeature } from '../../ol-ext/geojson'
  import { defaultEditStyle, style as createStyle } from '../../ol-ext/style'
  import observableFromOlEvent from '../../rx-ext/from-ol-event'
  import { hasInteraction, hasMap } from '../../util/assert'
  import { constant, stubArray, isFunction, forEach, mapValues, difference } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'

  // todo add other options, like event modifiers
  const props = {
    filter: {
      type: Function,
      default: constant(true),
    },
    hitTolerance: {
      type: Number,
      default: 0,
    },
    multi: {
      type: Boolean,
      default: false,
    },
    /**
     * Selected features as array of GeoJSON features with coordinates in the map view projection.
     * @type {string[]|number[]|GeoJSONFeature[]}
     */
    features: {
      type: Array,
      default: stubArray,
    },
    wrapX: {
      type: Boolean,
      default: true,
    },
  }

  const computed = {
  }

  const methods = {
    /**
     * @return {ol.interaction.Select}
     * @protected
     */
    createInteraction () {
      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter: this.filter,
        style: this.createStyleFunc(),
      })
    },
    /**
     * @return {ol.StyleFunction}
     * @protected
     */
    getDefaultStyles () {
      const defaultStyles = mapValues(defaultEditStyle(), styles => styles.map(createStyle))

      return function __selectDefaultStyleFunc (feature) {
        if (feature.getGeometry()) {
          return defaultStyles[feature.getGeometry().getType()]
        }
      }
    },
    /**
     * @return {ol.Feature[]}
     */
    getFeatures () {
      return (this.$interaction && this.$interaction.getFeatures().getArray()) || []
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(
        this::interaction.methods.getServices(),
        this::stylesContainer.methods.getServices()
      )
    },
    /**
     * @return {ol.interaction.Interaction|undefined}
     * @protected
     */
    getStyleTarget () {
      return this.$interaction
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this::interaction.methods.mount()
      this.features.forEach(this.select)
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
      hasMap(this)
      hasInteraction(this)

      let id = getFeatureId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.$feature
      }

      const selectedIds = this.$features.map(getFeatureId)
      if (selectedIds.includes(id)) return

      if (!(feature instanceof Feature)) {
        feature = undefined
        forEach(this.$map.getLayers().getArray(), layer => {
          const source = layer.getSource()

          if (source && isFunction(source.getFeatureById)) {
            feature = source.getFeatureById(id)
          }

          return !feature
        })
      }

      feature && this.$interaction.getFeatures().push(feature)
    },
    /**
     * @param {GeoJSONFeature|Vue|ol.Feature|string|number} feature
     * @return {void}
     */
    unselect (feature) {
      hasInteraction(this)

      let id = getFeatureId(feature)
      if (!id) {
        throw new Error('Undefined feature id')
      }
      if (feature instanceof Vue) {
        feature = feature.$feature
      }

      const selectedIds = this.$features.map(getFeatureId)
      const idx = selectedIds.findIndex(x => x === id)

      if (idx !== -1) {
        this.$interaction.getFeatures().removeAt(idx)
      }
    },
    /**
     * @param {Array<{style: ol.style.Style, condition: (function|boolean|undefined)}>|ol.StyleFunction|Vue|undefined} styles
     * @return {void}
     * @protected
     */
    setStyle (styles) {
      if (styles !== this._styles) {
        this._styles = styles
        this.refresh()
      }
    },
    /**
     * @return {Promise}
     */
    refresh () {
      return Promise.all([
        new Promise(resolve => {
          if (this.$interaction) {
            const featuresCollection = this.$interaction.getFeatures()
            featuresCollection.once('change', () => resolve())
            featuresCollection.changed()
          } else {
            resolve()
          }
        }),
        this::interaction.methods.refresh(),
      ])
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
      hasInteraction(this)
      this.$interaction.getFeatures().clear()
    },
  }

  const diffById = (a, b) => getFeatureId(a) === getFeatureId(b)
  const watch = {
    features (value) {
      if (!this.$interaction) return

      let forSelect = difference(value, this.$features, diffById)
      let forUnselect = difference(this.$features, value, diffById)

      forSelect.forEach(this.select)
      forUnselect.forEach(this.unselect)
    },
  }

  // TODO: use featuresContainer mixin
  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, stylesContainer],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty: false,
      attrs () {
        return {
          class: this.$options.name,
        }
      },
    },
    created () {
      Object.defineProperties(this, {
        $features: {
          enumerable: true,
          get: this.getFeatures,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    hasInteraction(this)

    const events = observableFromOlEvent(this.$interaction, 'select')

    this.subscribeTo(
      events,
      ({ selected, deselected, mapBrowserEvent }) => {
        ++this.rev

        deselected.forEach(feature => this.$emit('unselect', { feature, mapBrowserEvent }))
        selected.forEach(feature => this.$emit('select', { feature, mapBrowserEvent }))
        this.$emit('update:features', this.$features.map(feature => writeFeature(feature)))
      }
    )
  }
</script>
