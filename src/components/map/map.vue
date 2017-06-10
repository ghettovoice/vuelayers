<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { noop, isEqual } from 'lodash/fp'
  import Map from 'ol/map'
  import olcontrol from 'ol/control'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import Observable from '../../rx-ext'
  import { proj } from '../../ol-ext'
  import cmp from '../ol-cmp'
  import { assertHasMap, assertHasView } from '../../utils/assert'

  const props = {
    defControls: {
      type: Boolean,
      default: true
    },
    keyboardEventTarget: [String, Element],
    loadTilesWhileAnimating: {
      type: Boolean,
      default: false
    },
    loadTilesWhileInteracting: {
      type: Boolean,
      default: false
    },
    logo: [String, Object],
    pixelRatio: {
      type: Number,
      default: 1
    },
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
     * @return {ol.Map}
     * @protected
     */
    createOlObject () {
      // todo disable all default interaction and controls and use custom if defined, wrap all
      /**
       * @type {ol.Map}
       * @private
       */
      return new Map({
        layers: [],
//      interactions: [],
        controls: this.defControls ? olcontrol.defaults() : [],
        loadTilesWhileAnimating: this.loadTilesWhileAnimating,
        loadTilesWhileInteracting: this.loadTilesWhileInteracting,
        pixelRatio: this.pixelRatio,
        renderer: this.renderer,
        logo: this.logo,
        keyboardEventTarget: this.keyboardEventTarget
      })
    },
    /**
     * @return {void}
     * @protected
     */
    defineAccessors () {
      this::cmp.methods.defineAccessors()
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
     * @param {function(feature: ol.Feature, layer: (ol.layer.Layer|undefined))} callback
     * @param {Object} [opts]
     * @return {T|undefined}
     */
    forEachFeatureAtPixel (pixel, callback, opts = {}) {
      assertHasMap(this)
      return this.map.forEachFeatureAtPixel(pixel, callback, opts)
    },
    /**
     * @param {number[]} pixel
     * @param {function(layer: ol.layer.Layer, rgba: (number[]|undefined))} callback
     * @param {function(layer: ol.layer.Layer)} [layerFilter]
     * @return {T|undefined}
     */
    forEachLayerAtPixel (pixel, callback, layerFilter = noop) {
      assertHasMap(this)
      return this.map.forEachLayerAtPixel(pixel, callback, undefined, layerFilter)
    },
    /**
     * @param {number[]} pixel
     * @return {number[]} Coordinates in EPSG:4326
     */
    getCoordinateFromPixel (pixel) {
      assertHasMap(this)
      assertHasView(this)

      return proj.toLonLat(this.map.getCoordinateFromPixel(pixel), this.view.getProjection())
    },
    /**
     * @return {ol.Map|undefined}
     */
    getMap () {
      return this.olObject
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      return mergeDescriptors(this::cmp.methods.getServices(), {
        map: this
      })
    },
    /**
     * @return {ol.View|undefined}
     */
    getView () {
      assertHasMap(this)
      return this.map.getView()
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      assertHasMap(this)
      this.map.setTarget(this.$refs.map)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assertHasMap(this)
      this.unsubscribeAll()
      this.map.setTarget(undefined)
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
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToMapEvents()
    }
  }

  export default {
    name: 'vl-map',
    mixins: [cmp],
    props,
    methods,
    mounted () {
      this.$nextTick(this.refresh)
    }
  }

  /**
   * Subscribe to OL map events.
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assertHasMap(this)
    assertHasView(this)

    const ft = 1000 / 30
    // pointer
    const pointerEvents = Observable.merge(
      Observable.fromOlEvent(this.map, [
        'click',
        'dblclick',
        'singleclick'
      ]),
      Observable.fromOlEvent(this.map, [
        'pointerdrag',
        'pointermove'
      ]).throttleTime(ft)
        .distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate))
    ).map(evt => ({
      ...evt,
      coordinate: proj.toLonLat(evt.coordinate, this.view.getProjection())
    }))
    // other
    const otherEvents = Observable.fromOlEvent(this.map, [
      'postrender',
      'moveend',
      'precompose',
      'postcompose'
    ]).throttleTime(ft)

    const events = Observable.merge(
      pointerEvents,
      otherEvents
    )

    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>

<style lang="scss">
  @import "../../styles/mixins";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
