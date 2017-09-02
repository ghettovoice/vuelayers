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
  import layersContainer from '../layers-container'
  import interactionsContainer from '../interactions-container'
  import overlaysContainer from '../overlays-container'
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

  const methods = {
    /**
     * @return {{
     *    hasLayer: function(ol.Layer),
     *    addLayer: function(ol.Layer),
     *    removeLayer: function(ol.Layer)
     *  }|undefined}
     *  @protected
     */
    getLayersTarget () {
      if (!this.$map) return

      const layers = this.$map.getLayers()

      return {
        hasLayer (layer) {
          return layers.getArray().includes(layer)
        },
        addLayer (layer) {
          this.$map.addLayer(layer)
        },
        removeLayer (layer) {
          this.map.removeLayer(layer)
        }
      }
    },
    /**
     * @return {{
     *     hasInteraction: function(ol.interaction.Interaction): bool,
     *     addInteraction: function(ol.interaction.Interaction): void,
     *     removeInteraction: function(ol.interaction.Interaction): void
     *   }|undefined}
     * @protected
     */
    getInteractionsTarget () {
      if (!this.$map) return

      const interactions = this.$map.getInteractions()

      return {
        hasInteraction (interaction) {
          return interactions.getArray().includes(interaction)
        },
        addInteraction (interaction) {
          this.$map.addInteraction(interaction)
        },
        removeInteraction (interaction) {
          this.$map.removeInteraction(interaction)
        }
      }
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
     * @returns {Object}
     * @protected
     */
    getServices () {
      const vm = this

      return mergeDescriptors(
        this::cmp.methods.getServices(),
        this::layersContainer.methods.getServices(),
        this::interactionsContainer.methods.getServices(),
        this::overlaysContainer.methods.getServices(),
        {
          get map () { return vm.$map },
          get view () { return vm.$view },
          get viewContainer () { return vm }
        }
      )
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
    mixins: [cmp, layersContainer, interactionsContainer, overlaysContainer],
    props,
    methods,
    created () {
      /**
       * @type {ol.View}
       * @private
       */
      this._view = undefined

      Object.defineProperties(this, {
        /**
         * @type {ol.Map|undefined}
         */
        $map: {
          enumerable: true,
          get: () => this.$olObject
        },
        $view: {
          enumerable: true,
          get: () => this._view
        }
      })
    },
    destroyed () {
      this._view = undefined
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
