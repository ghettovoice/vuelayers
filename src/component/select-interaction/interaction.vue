<template>
  <i :id="vmId" :class="cmpName" style="display: none !important;">
    <slot :features="featuresDataProj" />
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import { never, shiftKeyOnly, singleClick } from 'ol/events/condition'
  import Feature from 'ol/Feature'
  import SelectInteraction from 'ol/interaction/Select'
  import { merge as mergeObs } from 'rxjs/observable'
  import { map as mapOp } from 'rxjs/operators'
  import Vue from 'vue'
  import { featuresContainer, interaction, projTransforms, stylesContainer } from '../../mixin'
  import { createStyle, defaultEditStyle, getFeatureId, getLayerId, initializeFeature } from '../../ol-ext'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasInteraction, hasMap } from '../../util/assert'
  import { constant, difference, forEach, isEqual, isFunction, mapValues, stubArray } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'vl-interaction-select',
    mixins: [interaction, featuresContainer, stylesContainer, projTransforms],
    stubVNode: {
      empty: false,
      attrs () {
        return {
          id: this.vmId,
          class: this.cmpName,
        }
      },
    },
    props: {
      /**
       * A function that takes an `ol.Feature` and an `ol.layer.Layer` and returns `true` if the feature may be selected or `false` otherwise.
       * @type {function|undefined}
       */
      filter: {
        type: Function,
        default: constant(true),
      },
      /**
       * A list of layers from which features should be selected. Alternatively, a filter function can be provided.
       * @type {string[]|function|undefined}
       */
      layers: {
        type: [Array, Function],
        default: undefined,
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
    },
    computed: {
      layerFilter () {
        return Array.isArray(this.layers)
          ? layer => this.layers.includes(getLayerId(layer))
          : this.layers
      },
    },
    methods: {
      /**
       * @return {Select}
       * @protected
       */
      createInteraction () {
        return new SelectInteraction({
          features: this.$featuresCollection,
          multi: this.multi,
          wrapX: this.wrapX,
          filter: this.filter,
          layers: this.layerFilter,
          hitTolerance: this.hitTolerance,
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
        feature = this.resolveFeature(feature)
        if (!feature) return

        this.addFeature(feature)
      },
      /**
       * @param {Object|Vue|Feature|string|number} feature
       * @return {void}
       */
      unselect (feature) {
        feature = this.resolveFeature(feature)
        if (!feature) return

        this.removeFeature(feature)
      },
      /**
       * Removes all features from selection.
       * @return {void}
       */
      unselectAll () {
        this.clearFeatures()
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
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::interaction.methods.subscribeAll()
        this::subscribeToInteractionChanges()
      },
      /**
       * @param {Object|Vue|Feature|string|number} feature
       * @return {Feature}
       */
      resolveFeature (feature) {
        hasMap(this)

        if (feature instanceof Vue) {
          feature = feature.$feature
        }

        if (feature instanceof Feature) {
          return feature
        }

        const featureId = getFeatureId(feature)
        if (!featureId) {
          throw new Error('Undefined feature id')
        }

        feature = undefined
        forEach(this.$map.getLayers().getArray(), layer => {
          if (this.layerFilter && !this.layerFilter(layer)) {
            return false
          }

          const source = layer.getSource()
          if (source && isFunction(source.getFeatureById)) {
            feature = source.getFeatureById(featureId)
          }

          return !feature
        })

        return feature
      },
    },
    watch: {
      features: {
        deep: true,
        handler (features) {
          if (!this.$interaction || isEqual(features, this.featuresDataProj)) return
          // select new features
          features.forEach(feature => {
            feature = initializeFeature({ ...feature })
            this.select(feature)
          })
          // unselect non-matched features
          difference(
            this.getFeatures(),
            features,
            (a, b) => getFeatureId(a) === getFeatureId(b),
          ).forEach(::this.unselect)
        },
      },
      featuresDataProj: {
        deep: true,
        handler: debounce(function (features) {
          this.$emit('update:features', features.slice())
        }, 1000 / 60),
      },
      ...makeWatchers([
        'filter',
        'hitTolerance',
        'multi',
        'wrapX',
        'addCondition',
        'condition',
        'removeCondition',
        'toggleCondition',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    hasInteraction(this)

    const select = observableFromOlEvent(this.$featuresCollection, 'add')
      .pipe(
        mapOp(({ element }) => ({ type: 'select', feature: element })),
      )
    const unselect = observableFromOlEvent(this.$featuresCollection, 'remove')
      .pipe(
        mapOp(({ element }) => ({ type: 'unselect', feature: element })),
      )
    const events = mergeObs(select, unselect)

    this.subscribeTo(events, evt => {
      this.$nextTick(() => {
        this.$emit(evt.type, evt.feature)
      })
    })
  }
</script>
