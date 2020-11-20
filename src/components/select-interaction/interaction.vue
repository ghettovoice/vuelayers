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
  import { featuresContainer, interaction, makeChangeOrRecreateWatchers, styleContainer } from '../../mixins'
  import { dumpStyle, getFeatureId, getLayerId, initializeFeature, isGeoJSONFeature } from '../../ol-ext'
  import { fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import {
    assert,
    clonePlainObject,
    coalesce,
    constant,
    forEach, isArray,
    isEqual,
    isFunction,
    isNumber,
    isObjectLike, isPlainObject,
    isString,
    map,
    mergeDescriptors,
    or,
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
    data () {
      return {
        currentHitTolerance: this.hitTolerance,
      }
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
        return map(this.features, feature => {
          if (isGeoJSONFeature(feature)) {
            feature = this.writeFeatureInViewProj(this.readFeatureInDataProj(feature))
          }
          return feature
        })
      },
      currentFeaturesDataProj () {
        if (!this.rev) return []

        return map(this.getFeatures(), feature => this.writeFeatureInDataProj(feature))
      },
      currentFeaturesViewProj () {
        if (!this.rev) return []

        return map(this.getFeatures(), feature => this.writeFeatureInViewProj(feature))
      },
      currentFeatureIds () {
        return map(this.currentFeaturesDataProj, feature => getFeatureId(feature))
      },
      layerFilter () {
        return Array.isArray(this.layers)
          ? layer => this.layers.includes(getLayerId(layer))
          : this.layers
      },
      style () {
        if (!(this.rev && this.$style)) return

        let style = this.$style
        if (isFunction(style)) return style
        if (!style) return

        isArray(style) || (style = [style])

        return style.map(style => dumpStyle(style, geom => this.writeGeometryInDataProj(geom)))
      },
    },
    watch: {
      rev () {
        if (!this.$interaction) return

        if (this.currentHitTolerance !== this.$interaction.getHitTolerance()) {
          this.currentHitTolerance = this.$interaction.getHitTolerance()
        }
      },
      featuresViewProj: {
        deep: true,
        handler (features) {
          const ids = map(features, feature => isObjectLike(feature) ? getFeatureId(feature) : feature)
          if (isEqual(ids, this.currentFeatureIds)) return

          this.unselectAll()
          forEach(features, ::this.select)
        },
      },
      currentFeaturesDataProj: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.featuresDataProj)) return

          this.$emit('update:features', value && clonePlainObject(value))
        },
      },
      hitTolerance (value) {
        this.setHitTolerance(value)
      },
      currentHitTolerance (value) {
        if (value === this.hitTolerance) return

        this.$emit('update:hitTolerance', value)
      },
      style: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          if (isPlainObject(value) || isArray(value)) {
            value = clonePlainObject(value)
          }
          this.$emit('update:style', value)
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'filter',
        'multi',
        'wrapX',
        'addCondition',
        'condition',
        'removeCondition',
        'toggleCondition',
      ]),
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
          hitTolerance: this.currentHitTolerance,
          addCondition: this.addCondition,
          condition: this.condition,
          removeCondition: this.removeCondition,
          toggleCondition: this.toggleCondition,
          style: this.$style,
          features: this.$featuresCollection,
        })
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
          getStyle: () => this._style,
          setStyle: () => {
            if (process.env.VUELAYERS_DEBUG) {
              this.$logger.log('style changed, scheduling recreate...')
            }

            this.scheduleRecreate()
          },
        }
      },
      /**
       * @param {FeatureLike} feature
       */
      select (feature) {
        feature = this.resolveFeature(feature)
        if (!feature) return

        this.addFeature(feature)
      },
      /**
       * @param {FeatureLike} feature
       */
      unselect (feature) {
        feature = this.resolveFeature(feature)
        if (!feature) return

        this.removeFeature(feature)
      },
      /**
       * @return {void}
       */
      unselectAll () {
        this.clearFeatures()
      },
      /**
       * @param {Object|Vue|Feature|string|number} feature
       * @return {Feature|undefined}
       * @protected
       */
      resolveFeature (feature) {
        if (!feature) return
        feature = feature?.$feature || feature
        if (feature instanceof Feature) return feature

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
      getHitTolerance () {
        return coalesce(this.$interaction?.getHitTolerance(), this.currentHitTolerance)
      },
      setHitTolerance (tolerance) {
        assert(isNumber(tolerance), 'Invalid tolerance')

        if (tolerance !== this.currentHitTolerance) {
          this.currentHitTolerance = tolerance
        }
        if (this.$interaction && tolerance !== this.$interaction.getHitTolerance()) {
          this.$interaction.setHitTolerance(tolerance)
        }
      },
      async getLayer (feature) {
        feature = this.resolveFeature(feature)

        return (await this.resolveInteraction()).getLayer(feature)
      },
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
    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>
