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
  import 'rxjs/add/operator/share'
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
      layer = layer instanceof Vue ? layer.$layer : layer

      if (!layer) return

      if (!this._layers[layer.get('id')]) {
        this._layers[layer.get('id')] = layer
      }
      if (this.$map && !this.$map.getLayers().getArray().includes(layer)) {
        this.$map.addLayer(layer)
      }
    },
    /**
     * @param {ol.layer.Layer|Vue} layer
     * @return {void}
     */
    removeLayer (layer) {
      layer = layer instanceof Vue ? layer.$layer : layer

      if (!layer) return

      delete this._layers[layer.get('id')]

      if (this.$map && this.$map.getLayers().getArray().includes(layer)) {
        this.$map.removeLayer(layer)
      }
    },
    /**
     * @return {ol.layer.Layer[]}
     */
    getLayers () {
      return Object.values(this._layers)
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    addInteraction (interaction) {
      interaction = interaction instanceof Vue ? interaction.$interaction : interaction

      if (!interaction) return

      if (!this._interactions[interaction.get('id')]) {
        this._interactions[interaction.get('id')] = interaction
      }
      if (this.$map && !this.$map.getInteractions().getArray().includes(interaction)) {
        this.$map.addInteraction(interaction)
      }
    },
    /**
     * @param {ol.interaction.Interaction|Vue} interaction
     * @return {void}
     */
    removeInteraction (interaction) {
      interaction = interaction instanceof Vue ? interaction.$interaction : interaction

      if (!interaction) return

      delete this._interactions[interaction.get('id')]

      if (this.$map && this.$map.getInteractions().getArray().includes(interaction)) {
        this.$map.removeInteraction(interaction)
      }
    },
    /**
     * @return {ol.interaction.Interaction[]}
     */
    getInteractions () {
      return Object.values(this._interactions)
    },
    /**
     * @param {ol.Overlay|Vue} overlay
     * @return {void}
     */
    addOverlay (overlay) {
      overlay = overlay instanceof Vue ? overlay.$overlay : overlay

      if (!overlay) return

      if (!this._overlays[overlay.getId()]) {
        this._overlays[overlay.getId()] = overlay
      }
      if (this.$map && !this.$map.getOverlays().getArray().includes(overlay)) {
        this.$map.addOverlay(overlay)
      }
    },
    /**
     * @param {ol.Overlay|Vue} overlay
     * @return {void}
     */
    removeOverlay (overlay) {
      overlay = overlay instanceof Vue ? overlay.$overlay : overlay

      if (!overlay) return

      delete this._overlays[overlay.getId()]

      if (this.$map && this.$map.getOverlays().getArray().includes(overlay)) {
        this.$map.removeOverlay(overlay)
      }
    },
    /**
     * @return {ol.Overlay[]}
     */
    getOverlays () {
      return Object.values(this._overlays)
    },
    /**
     * @param {string|number} id
     * @return {ol.Overlay|undefined}
     */
    getOverlayById (id) {
      return this._overlays[id]
    },
    /**
     * @param {string|number} id
     * @return {ol.layer.Layer|undefined}
     */
    getLayerById (id) {
      return this._layers[id]
    },
    /**
     * @param {string|number} id
     * @return {ol.interaction.Interaction|undefined}
     */
    getInteractionById (id) {
      return this._interactions[id]
    },
    /**
     * @return {ol.Map}
     * @protected
     */
    createOlObject () {
      const map = new Map({
        controls: this.defControls ? olcontrol.defaults() : [],
        loadTilesWhileAnimating: this.loadTilesWhileAnimating,
        loadTilesWhileInteracting: this.loadTilesWhileInteracting,
        pixelRatio: this.pixelRatio,
        renderer: this.renderer,
        logo: this.logo,
        keyboardEventTarget: this.keyboardEventTarget,
        view: this._view
      })
      // ol.Map constructor can create default view if no provided with options
      this._view = map.getView()

      return map
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
     * @return {ol.View}
     */
    getView () {
      return this._view
    },
    /**
     * @param {ol.View|Vue|undefined} view
     * @return {void}
     */
    setView (view) {
      view = view instanceof Vue ? view.$view : view

      if (view !== this._view) {
        this._view = view
      }
      if (this.$map && view !== this.$map.getView()) {
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
    methods,
    created () {
      /**
       * @type {ol.View}
       * @private
       */
      this._view = undefined
      /**
       * @type {Object<string, ol.layer.Layer>}
       * @private
       */
      this._layers = Object.create(null)
      /**
       * @type {Object<string, ol.interaction.Interaction>}
       * @private
       */
      this._interactions = Object.create(null)
      /**
       * @type {Object<string, ol.Overlay>}
       * @private
       */
      this._overlays = Object.create(null)

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
    destroyed () {
      this._view = undefined
      this._layers = Object.create(null)
      this._interactions = Object.create(null)
      this._overlays = Object.create(null)
    }
  }

  /**
   * Subscribe to OL map events.
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assert.hasMap(this)
    assert.hasView(this)

    let events
    let eventsIdent = this.getFullIdent('events')

    if (this.$identityMap.has(eventsIdent)) {
      events = this.$identityMap.get(eventsIdent)
    } else {
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

      events = Observable.merge(
        pointerEvents,
        otherEvents
      ).share()

      if (eventsIdent) {
        this.$identityMap.set(eventsIdent, events)
      }
    }

    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }
</script>

<style lang="scss">
  @import "../../styles/mixins";

  .vl-map, .vl-map .map {
    @include vl-wh(100%, 100%);
  }
</style>
