<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { constant, isEqual } from 'lodash/fp'
  import Map from 'ol/map'
  import olControl from 'ol/control'
  import { VM_PROP } from '../../consts'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import Observable from '../../rx-ext'
  import { coordHelper, geoJson } from '../../ol-ext'
  import rxSubs from '../rx-subs'
  import services from '../services'
  import { assertHasMap, assertHasView } from '../../utils/assert'
  import plainProps from '../../utils/plain-props'

  const { toLonLat } = coordHelper

  const props = {
    defControls: {
      type: Boolean,
      default: true
    },
    keyboardEventTarget: [String, Element],
    loadTilesWhileAnimating: Boolean,
    loadTilesWhileInteracting: Boolean,
    logo: [String, Object],
    pixelRatio: Number,
    renderer: [String, Array],
    tabIndex: {
      type: Number,
      default: 0
    }
  }

  const methods = {
    /**
     * @param {ol.layer.Layer|Vue} layer
     * @return {void}
     */
    addLayer (layer) {
      assertHasMap(this)

      layer = layer instanceof Vue ? layer.layer : layer
      this.map.addLayer(layer)
    },
    /**
     * @param {ol.layer.Layer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
      assertHasMap(this)

      layer = layer instanceof Vue ? layer.layer : layer
      this.map.removeLayer(layer)
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    addInteraction (interaction) {
      assertHasMap(this)

      interaction = interaction instanceof Vue ? interaction.interaction : interaction
      this.map.addInteraction(interaction)
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    removeInteraction (interaction) {
      assertHasMap(this)

      interaction = interaction instanceof Vue ? interaction.interaction : interaction
      this.map.removeInteraction(interaction)
    },
    /**
     * Trigger focus on map container.
     * @return {void}
     */
    focus () {
      this.$refs.map.focus()
    },
    /**
     * @param {number[]} pixel
     * @param {function(feature: GeoJSONFeature, layer: (Object|undefined))} callback
     * @param {Object} [opts]
     * @return {T|undefined}
     */
    forEachFeatureAtPixel (pixel, callback, opts = {}) {
      assertHasMap(this)

      const cb = (feature, layer) => {
        assertHasView(this)

        return callback(
          geoJson.writeFeature(feature, this.view.getProjection()),
          layer && plainProps(layer.getProperties())
        )
      }
      const layerFilter = opts.layerFilter || constant(true)
      opts.layerFilter = layer => layerFilter(plainProps(layer.getProperties()))

      return this.map.forEachFeatureAtPixel(pixel, cb, opts)
    },
    /**
     * @param {number[]} pixel
     * @param {function(layer: Object, rgba: (number[]|undefined))} callback
     * @param {function(layer: Object)} [layerFilter]
     * @return {T|undefined}
     */
    forEachLayerAtPixel (pixel, callback, layerFilter = () => {}) {
      assertHasMap(this)

      const cb = (layer, rgba) => {
        return callback(
          plainProps(layer.getProperties()),
          rgba
        )
      }
      const lf = layer => layerFilter(plainProps(layer.getProperties()))

      return this.map.forEachLayerAtPixel(pixel, cb, undefined, lf)
    },
    /**
     * @param {number[]} pixel
     * @return {number[]} Coordinates in EPSG:4326
     */
    getCoordinateFromPixel (pixel) {
      assertHasMap(this)
      assertHasView(this)

      return toLonLat(this.map.getCoordinateFromPixel(pixel), this.view.getProjection())
    },
    /**
     * @return {ol.Map|undefined}
     */
    getMap () {
      return this._map
    },
    /**
     * @return {ol.View|undefined}
     */
    getView () {
      assertHasMap(this)
      return this.map.getView()
    },
    /**
     * @param {ol.View|Vue|undefined} view
     * @return {void}
     */
    setView (view) {
      assertHasMap(this)

      view = view instanceof Vue ? view.view : view
      this.map.setView(view)
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(this::services.methods.getServices(), {
        map: this
      })
    },
    /**
     * Triggers map re-render.
     * @return {void}
     */
    refresh () {
      assertHasMap(this)

      this.map.updateSize()
      this.map.render()
    },
    // protected & private
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToMapEvents()
    }
  }

  export default {
    name: 'vl-map',
    mixins: [rxSubs, services],
    props,
    methods,
    created () {
      this::initialize()
    },
    mounted () {
      this::mount()
      this.$nextTick(this.refresh)
    },
    destroyed () {
      this::unmount()
      this._map = undefined
    }
  }

  /**
   * @return {void}
   * @private
   */
  function initialize () {
    // todo disable all default interaction and controls and use custom if defined, wrap all
    /**
     * @type {ol.Map}
     * @private
     */
    this._map = new Map({
      layers: [],
//      interactions: [],
      controls: this.defControls ? olControl.defaults() : [],
      loadTilesWhileAnimating: this.loadTilesWhileAnimating,
      loadTilesWhileInteracting: this.loadTilesWhileInteracting,
      pixelRatio: this.pixelRatio,
      renderer: this.renderer,
      logo: this.logo,
      keyboardEventTarget: this.keyboardEventTarget
    })
    this._map.set(VM_PROP, this)
    this::defineAccessors()
  }

  /**
   * @return {void}
   * @private
   */
  function defineAccessors () {
    Object.defineProperties(this, {
      map: {
        enumerable: true,
        get: this.getMap
      },
      view: {
        enumerable: true,
        get: this.getView
      }
    })
  }

  /**
   * @return {void}
   * @private
   */
  function mount () {
    assertHasMap(this)

    this.map.setTarget(this.$refs.map)
    this.subscribeAll()
  }

  /**
   * @return {void}
   * @private
   */
  function unmount () {
    assertHasMap(this)

    this.unsubscribeAll()
    this.map.setTarget(undefined)
  }

  /**
   * Subscribe to OL map events.
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assertHasMap(this)
    assertHasView(this)

    const pointerEvents = Observable.merge(
      Observable.fromOlEvent(this.map, [
        'click',
        'dblclick',
        'singleclick'
      ]),
      Observable.fromOlEvent(this.map, [
        'pointerdrag',
        'pointermove'
      ]).throttleTime(1000 / 30)
        .distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate))
    ).map(evt => ({
      ...evt,
      coordinate: toLonLat(evt.coordinate, this.view.getProjection())
    }))
    const mapEvents = Observable.fromOlEvent(this.map, [
      'postrender',
      'moveend'
    ])
    const renderEvents = Observable.fromOlEvent(this.map, [
      'precompose',
      'postcompose'
    ])

    const events = Observable.merge(
      pointerEvents,
      mapEvents,
      renderEvents
    )

    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>

<style lang="scss">
  @import "../../styles/mixins";
  @import "~ol/ol";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
