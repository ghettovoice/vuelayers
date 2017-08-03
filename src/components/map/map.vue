<template>
  <div class="vl-map">
    <div class="map" :tabindex="tabIndex" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { isEqual } from 'lodash/fp'
  import Map from 'ol/map'
  import olcontrol from 'ol/control'
  import mergeDescriptors from '../../utils/multi-merge-descriptors'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import '../../rx-ext'
  import { proj as projHelper } from '../../ol-ext'
  import cmp from '../ol-cmp'
  import * as assert from '../../utils/assert'

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
    moveTolerance: Number,
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

  // todo add getLayerById, getInteractionById
  const methods = {
    /**
     * @param {ol.layer.Layer|Vue} layer
     * @return {void}
     */
    addLayer (layer) {
      assert.hasMap(this)

      layer = layer instanceof Vue ? layer.$layer : layer
      if (layer && !this.$layers.includes(layer)) {
        this.$map.addLayer(layer)
      }
    },
    /**
     * @param {ol.layer.Layer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
      assert.hasMap(this)

      layer = layer instanceof Vue ? layer.$layer : layer
      this.$map.removeLayer(layer)
    },
    /**
     * @return {ol.layer.Layer[]}
     */
    getLayers () {
      return (this.$map && this.$map.getLayers().getArray()) || []
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    addInteraction (interaction) {
      assert.hasMap(this)

      interaction = interaction instanceof Vue ? interaction.$interaction : interaction
      if (interaction && !this.$interactions.includes(interaction)) {
        this.$map.addInteraction(interaction)
      }
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    removeInteraction (interaction) {
      assert.hasMap(this)

      interaction = interaction instanceof Vue ? interaction.$interaction : interaction
      this.$map.removeInteraction(interaction)
    },
    /**
     * @return {ol.interaction.Interaction[]}
     */
    getInteractions () {
      return (this.$map && this.$map.getInteractions().getArray()) || []
    },
    /**
     * @param {ol.Overlay|Vue} overlay
     * @return {void}
     */
    addOverlay (overlay) {
      assert.hasMap(this)

      overlay = overlay instanceof Vue ? overlay.$overlay : $overlay
      this.$map.addOverlay(overlay)
    },
    /**
     * @param {ol.Overlay|Vue} overlay
     * @return {void}
     */
    removeOverlay (overlay) {
      assert.hasMap(this)

      overlay = overlay instanceof Vue ? overlay.$overlay : $overlay
      this.$map.removeOverlay(overlay)
    },
    /**
     * @return {ol.Overlay[]}
     */
    getOverlays () {
      return (this.$map && this.$map.getOverlays().getArray()) || []
    },
    /**
     * @param {string|number}
     * @return {ol.Overlay|undefined}
     */
    getOverlayById (id) {
      assert.hasMap(this)

      return this.$map.getOverlayById(id)
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
        // interactions: [],
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
      Object.defineProperties(this, {
        $map: {
          enumerable: true,
          get: this.getMap
        },
        $view: {
          enumerable: true,
          get: this.getView
        },
        $layers: {
          enumerable: true,
          get: this.getLayers
        },
        $interactions: {
          enumerable: true,
          get: this.getInteractions
        },
        $overlays: {
          enumerable: true,
          get: this.getOverlays
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
      assert.hasMap(this)

      return this.$map.forEachFeatureAtPixel(pixel, callback, opts)
    },
    /**
     * @param {number[]} pixel
     * @param {function(layer: ol.layer.Layer, rgba: (number[]|undefined))} callback
     * @param {function(layer: ol.layer.Layer)} [layerFilter]
     * @return {T|undefined}
     */
    forEachLayerAtPixel (pixel, callback, layerFilter) {
      assert.hasMap(this)

      return this.$map.forEachLayerAtPixel(pixel, callback, undefined, layerFilter)
    },
    /**
     * @param {number[]} pixel
     * @return {number[]} Coordinates in EPSG:4326
     */
    getCoordinateFromPixel (pixel) {
      assert.hasMap(this)
      assert.hasView(this)

      return projHelper.toLonLat(this.$map.getCoordinateFromPixel(pixel), this.$view.getProjection())
    },
    /**
     * @return {ol.Map|undefined}
     */
    getMap () {
      return this.$olObject
    },
    /**
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(this::cmp.methods.getServices(), {
        get map () { return vm.$map },
        get view () { return vm.$view }
      })
    },
    /**
     * @return {ol.View|undefined}
     */
    getView () {
      return this.$map && this.$map.getView()
    },
    /**
     * @param {ol.View|Vue|undefined} view
     * @return {void}
     */
    setView (view) {
      assert.hasMap(this)

      view = view instanceof Vue ? view.$view : view
      if (view !== this.$view) {
        this.$map.setView(view)
      }
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      assert.hasMap(this)
      this.$map.setTarget(this.$refs.map)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assert.hasMap(this)
      this.unsubscribeAll()
      this.$map.setTarget(undefined)
    },
    /**
     * Triggers map re-render.
     * @return {Promise}
     */
    refresh () {
      return new Promise(resolve => {
        assert.hasMap(this)

        this.$map.once('postrender', () => resolve())
        this.$map.updateSize()
        this.$map.render()
      })
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
    methods
  }

  /**
   * Subscribe to OL map events.
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assert.hasMap(this)
    assert.hasView(this)

    const ft = 100
    // pointer
    const pointerEvents = Observable.merge(
      Observable.fromOlEvent(this.$map, [
        'click',
        'dblclick',
        'singleclick'
      ]),
      Observable.fromOlEvent(this.$map, [
        'pointerdrag',
        'pointermove'
      ]).throttleTime(ft)
        .distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate))
    ).map(evt => ({
      ...evt,
      coordinate: projHelper.toLonLat(evt.coordinate, this.$view.getProjection())
    }))
    // other
    const otherEvents = Observable.fromOlEvent(this.$map, [
      'movestart',
      'moveend',
      'postrender',
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
