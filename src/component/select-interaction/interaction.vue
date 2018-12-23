<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :features="features"/>
  </i>
</template>

<script>
  import { never, shiftKeyOnly, singleClick } from 'ol/events/condition'
  import Feature from 'ol/Feature'
  import SelectInteraction from 'ol/interaction/Select'
  import Vue from 'vue'
  import interaction from '../../mixin/interaction'
  import projTransforms from '../../mixin/proj-transforms'
  import stylesContainer from '../../mixin/styles-container'
  import { getFeatureId } from '../../ol-ext/feature'
  import { createStyle, defaultEditStyle } from '../../ol-ext/style'
  import observableFromOlEvent from '../../rx-ext/from-ol-event'
  import { hasInteraction, hasMap } from '../../util/assert'
  import { constant, difference, forEach, isFunction, mapValues, stubArray } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * @vueProps
   */
  const props = {
    /**
     * A function that takes an `ol.Feature` and an `ol.layer.Layer` and returns `true` if the feature may be selected or `false` otherwise.
     * @type {function|undefined}
     */
    filter: {
      type: Function,
      default: constant(true),
    },
    /**
     * Hit-detection tolerance. Pixels inside the radius around the given position will be checked for features.
     * This only works for the canvas renderer and not for WebGL.
     * @type {number}
     */
    hitTolerance: {
      type: Number,
      default: 0,
    },
    /**
     * A boolean that determines if the default behaviour should select only single features or all (overlapping)
     * features at the clicked map position.
     * @type {boolean}
     */
    multi: {
      type: Boolean,
      default: false,
    },
    /**
     * Selected features as array of GeoJSON features with coordinates in the map view projection.
     * @type {string[]|number[]|Object[]}
     */
    features: {
      type: Array,
      default: stubArray,
    },
    /**
     * Wrap the world horizontally on the selection overlay.
     * @type {boolean}
     */
    wrapX: {
      type: Boolean,
      default: true,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should
     * be handled. By default, this is `ol.events.condition.never`. Use this if you want to use different events
     * for `add` and `remove` instead of `toggle`.
     * @type {function|undefined}
     */
    addCondition: {
      type: Function,
      default: never,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
     * This is the event for the selected features as a whole. By default, this is `ol.events.condition.singleClick`.
     * Clicking on a feature selects that feature and removes any that were in the selection. Clicking outside any feature
     * removes all from the selection.
     * @type {function|undefined}
     */
    condition: {
      type: Function,
      default: singleClick,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
     * By default, this is `ol.events.condition.never`. Use this if you want to use different events for `add` and `remove`
     * instead of `toggle`.
     * @type {function|undefined}
     */
    removeCondition: {
      type: Function,
      default: never,
    },
    /**
     * A function that takes an `ol.MapBrowserEvent` and returns a boolean to indicate whether that event should be handled.
     * This is in addition to the `condition` event. By default, `ol.events.condition.shiftKeyOnly`, i.e. pressing `shift`
     * as well as the `condition` event, adds that feature to the current selection if it is not currently selected,
     * and removes it if it is.
     * @type {function|undefined}
     */
    toggleCondition: {
      type: Function,
      default: shiftKeyOnly,
    },
  }

  /**
   * @vueComputed
   */
  const computed = {}

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @return {Select}
     * @protected
     */
    createInteraction () {
      return new SelectInteraction({
        multi: this.multi,
        wrapX: this.wrapX,
        filter: this.filter,
        style: this.createStyleFunc(),
        addCondition: this.addCondition,
        condition: this.condition,
        removeCondition: this.removeCondition,
        toggleCondition: this.toggleCondition,
      })
    },
    /**
     * @return {function(feature: Feature): Style}
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
     * @return {Feature[]}
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
        this::stylesContainer.methods.getServices(),
      )
    },
    /**
     * @return {Interaction|undefined}
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
     * @param {Object|Vue|Feature|string|number} feature
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
     * @param {Object|Vue|Feature|string|number} feature
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
     * @param {Array<{style: Style, condition: (function|boolean|undefined)}>|function(feature: Feature): Style|Vue|undefined} styles
     * @return {void}
     * @protected
     */
    setStyle (styles) {
      if (styles !== this._styles) {
        this._styles = styles
        this.scheduleRefresh()
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

  const watch = {
    ...makeWatchers([
      'filter',
      'hitTolerance',
      'multi',
      'wrapX',
      'addCondition',
      'condition',
      'removeCondition',
      'toggleCondition',
    ], () => function () { this.scheduleRecreate() }),
    features (value) {
      if (!this.$interaction) return

      let diffById = (a, b) => getFeatureId(a) === getFeatureId(b)
      let forSelect = difference(value, this.$features, diffById)
      let forUnselect = difference(this.$features, value, diffById)

      forSelect.forEach(this.select)
      forUnselect.forEach(this.unselect)
    },
  }

  /**
   * @vueProto
   * @alias module:select-interaction/interaction
   * @title vl-interaction-select
   */
  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, stylesContainer, projTransforms],
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
        this.$emit('update:features', this.$features.map(::this.writeFeatureInDataProj))
      },
    )
  }
</script>
