<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot :features="currentFeaturesDataProj" />
  </i>
</template>

<script>
  import { Feature } from 'ol'
  import { never, shiftKeyOnly, singleClick } from 'ol/events/condition'
  import { Select as SelectInteraction } from 'ol/interaction'
  import { merge as mergeObs } from 'rxjs'
  import { featuresContainer, interaction, styleContainer } from '../../mixins'
  import { getFeatureId, getLayerId, initializeFeature, isGeoJSONFeature } from '../../ol-ext'
  import { fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import {
    clonePlainObject,
    constant,
    forEach,
    isEqual,
    isFunction,
    isNumber,
    isObjectLike,
    isString,
    makeWatchers,
    map,
    mergeDescriptors,
    or,
    sequential,
    stubArray,
  } from '../../utils'

  export default {
    name: 'VlInteractionSelect',
    mixins: [
      featuresContainer,
      styleContainer,
      interaction,
    ],
    props: {
      /**
       * A function that takes an `ol.Feature` and an `ol.layer.Layer` and returns `true` if the feature may be selected or `false` otherwise.
       * @type {function|undefined}
       */
      filter: {
        type: Function,
        default: /*#__PURE__*/constant(true),
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
        validator: value => value.every(or(isString, isNumber, isGeoJSONFeature)),
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
      featuresDataProj () {
        return map(this.features, feature => {
          if (isGeoJSONFeature(feature)) {
            feature = initializeFeature(clonePlainObject(feature))
          }
          return feature
        })
      },
      featuresViewProj () {
        return map(this.featuresDataProj, feature => this.writeFeatureInViewProj(this.readFeatureInDataProj(feature)))
      },
      layerFilter () {
        return Array.isArray(this.layers)
          ? layer => this.layers.includes(getLayerId(layer))
          : this.layers
      },
      currentFeatureIds () {
        return map(this.currentFeaturesDataProj, feature => getFeatureId(feature))
      },
    },
    watch: {
      featuresViewProj: {
        deep: true,
        handler: /*#__PURE__*/sequential(async function (features) {
          const ids = map(features, feature => isObjectLike(feature) ? getFeatureId(feature) : feature)
          if (isEqual(ids, this.currentFeatureIds)) return

          await this.unselectAll()
          await Promise.all(map(features, ::this.select))
        }),
      },
      .../*#__PURE__*/makeWatchers([
        'filter',
        'hitTolerance',
        'multi',
        'wrapX',
        'addCondition',
        'condition',
        'removeCondition',
        'toggleCondition',
      ], prop => /*#__PURE__*/sequential(async function (val, prev) {
        if (isEqual(val, prev)) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      })),
    },
    methods: {
      /**
       * @return {Select}
       * @protected
       */
      createInteraction () {
        return new SelectInteraction({
          multi: this.multi,
          filter: this.filter,
          layers: this.layerFilter,
          hitTolerance: this.hitTolerance,
          addCondition: this.addCondition,
          condition: this.condition,
          removeCondition: this.removeCondition,
          toggleCondition: this.toggleCondition,
          style: this.$style,
          features: this.$featuresCollection,
        })
      },
      /**
       * @protected
       */
      async mount () {
        await Promise.all(map(this.featuresDataProj, ::this.select))
        await this::interaction.methods.mount()
      },
      /**
       * @returns {Object}
       * @protected
       */
      getServices () {
        return mergeDescriptors(
          this::interaction.methods.getServices(),
          this::featuresContainer.methods.getServices(),
          this::styleContainer.methods.getServices(),
        )
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::interaction.methods.subscribeAll()
        this::featuresContainer.methods.subscribeAll()
        this::subscribeToInteractionChanges()
      },
      /**
       * @return {StyleTarget}
       * @protected
       */
      getStyleTarget () {
        return {
          setStyle: async () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            await this.scheduleRecreate()
          },
        }
      },
      /**
       * @param {FeatureLike} feature
       * @return {Promise<void>}
       */
      async select (feature) {
        feature = await this.resolveFeature(feature)
        if (!feature) return

        await this.addFeature(feature)
      },
      /**
       * @param {FeatureLike} feature
       * @return {Promise<void>}
       */
      async unselect (feature) {
        feature = await this.resolveFeature(feature)
        if (!feature) return

        await this.removeFeature(feature)
      },
      /**
       * @return {void}
       */
      unselectAll () {
        this.clearFeatures()
      },
      /**
       * @param {Object|Vue|Feature|string|number} feature
       * @return {Promise<Feature|undefined>}
       * @protected
       */
      async resolveFeature (feature) {
        if (!feature) return
        if (isFunction(feature.resolveOlObject)) {
          feature = await feature.resolveOlObject()
        }
        if (feature instanceof Feature) {
          return feature
        }

        const featureId = isString(feature) || isNumber(feature) ? feature : getFeatureId(feature)
        if (!featureId) {
          throw new Error(`${this.vmName} undefined feature id`)
        }

        feature = null
        forEach(this.$mapVm.getLayers(), layer => {
          if (this.layerFilter && !this.layerFilter(layer)) {
            return
          }

          const source = layer.getSource()
          if (isFunction(source?.getFeatureById)) {
            feature = source.getFeatureById(featureId)
          }

          return !feature
        })

        return feature
      },
      updateFeature (feature) { /* disable update here, because wil always work with origin feature */ },
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToInteractionChanges () {
    const select = obsFromVueEvent(this, 'addfeature', evt => ({
      type: 'select',
      feature: evt.feature,
      get json () { return evt.json },
    }))
    const unselect = obsFromVueEvent(this, 'removefeature', evt => ({
      type: 'unselect',
      feature: evt.feature,
      get json () { return evt.json },
    }))
    const events = mergeObs(select, unselect)
    this.subscribeTo(events, evt => {
      this.$emit(evt.type, evt)
    })
  }
</script>
