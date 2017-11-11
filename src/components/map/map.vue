<template>
  <div :class="[$options.name]" :tabindex="tabindex">
    <slot></slot>
  </div>
</template>

<script>
  /**
   * @module map/map
   */
  import Vue from 'vue'
  import { isEqual } from 'lodash/fp'
  import Map from 'ol/map'
  import VectorLayer from 'ol/layer/vector'
  import VectorSource from 'ol/source/vector'
  import olcontrol from 'ol/control'
  import { Observable } from 'rxjs/Observable'
  import { merge as mergeObs } from 'rxjs/observable/merge'
  import { throttleTime } from 'rxjs/operator/throttleTime'
  import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged'
  import { map as mapObs } from 'rxjs/operator/map'
  import {
    RENDERER_TYPE,
    projHelper,
    observableFromOlEvent,
    mergeDescriptors,
    assert,
    olCmp,
    layersContainer,
    interactionsContainer,
    overlaysContainer,
    featuresContainer,
  } from '../../core'

  /**
   * @vueProps
   */
  const props = /** @lends module:map/map# */{
    /**
     * Options for default controls added to the map by default. Set to `false` to disable all map controls. Object
     * value is used to configure controls.
     * @type {Object|boolean}
     * @todo remove when vl-control-* components will be ready
     */
    controls: {
      type: [Object, Boolean],
      default: true,
    },
    /**
     * The element to listen to keyboard events on. For example, if this option is set to `document` the keyboard
     * interactions will always trigger. If this option is not specified, the element the library listens to keyboard
     * events on is the component root element.
     * @type {string|Element|Document}
     */
    keyboardEventTarget: [String, Element, Document],
    /**
     * When set to `true`, tiles will be loaded during animations.
     * @type {boolean}
     */
    loadTilesWhileAnimating: {
      type: Boolean,
      default: false,
    },
    /**
     * When set to `true`, tiles will be loaded while interacting with the map.
     * @type {boolean}
     */
    loadTilesWhileInteracting: {
      type: Boolean,
      default: false,
    },
    /**
     * The map logo. If a **string** is provided, it will be set as the image source of the logo. If an **object** is provided,
     * the `src` property should be the **URL** for an image and the `href` property should be a **URL** for creating a link.
     * If an **element** is provided, the **element** will be used. To disable the map logo, set the option to `false`.
     * By default, the **OpenLayers** logo is shown.
     * @type {boolean|string|Object|Element}
     */
    logo: [String, Object, Element, Boolean],
    /**
     * The minimum distance in pixels the cursor must move to be detected as a map move event instead of a click.
     * Increasing this value can make it easier to click on the map.
     * @type {Number}
     */
    moveTolerance: {
      type: Number,
      default: 1,
    },
    /**
     * The ratio between physical pixels and device-independent pixels (dips) on the device.
     * @type {number}
     */
    pixelRatio: {
      type: Number,
      default: 1,
    },
    /**
     * Renderer. By default, **Canvas** and **WebGL** renderers are tested for support in that order,
     * and the first supported used. **Note** that the **Canvas** renderer fully supports vector data,
     * but **WebGL** can only render **Point** geometries.
     * @type {string|string[]}
     * @default ['canvas', 'webgl']
     */
    renderer: {
      type: [String, Array],
      default: () => [RENDERER_TYPE.CANVAS, RENDERER_TYPE.WEBGL],
    },
    /**
     * Root element `tabindex` attribute value. Value should be provided to allow keyboard events on map.
     * @type {number|string}
     */
    tabindex: [String, Number],
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:map/map# */{
    /**
     * @return {ol.Map}
     * @protected
     */
    createOlObject () {
      const map = new Map({
        controls: [],
        loadTilesWhileAnimating: this.loadTilesWhileAnimating,
        loadTilesWhileInteracting: this.loadTilesWhileInteracting,
        pixelRatio: this.pixelRatio,
        renderer: this.renderer,
        logo: this.logo,
        keyboardEventTarget: this.keyboardEventTarget,
        view: this._view,
      })
      // ol.Map constructor can create default view if no provided with options
      this._view = map.getView()
      // add default overlay to map
      this._defaultLayer.setMap(map)

      if (this.controls) {
        let opts = typeof this.controls === 'object' ? this.controls : undefined
        map.getControls().extend(olcontrol.defaults(opts).getArray())
      }

      return map
    },
    /**
     * @return {{
     *    hasLayer: function(ol.Layer): boolean,
     *    addLayer: function(ol.Layer),
     *    removeLayer: function(ol.Layer)
     *  }|undefined}
     *  @protected
     */
    getLayersTarget () {
      if (!this.$map) return

      const map = this.$map
      const layers = this.$map.getLayers()

      return {
        hasLayer (layer) {
          return layers.getArray().includes(layer)
        },
        addLayer (layer) {
          map.addLayer(layer)
        },
        removeLayer (layer) {
          map.removeLayer(layer)
        },
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

      const map = this.$map
      const interactions = this.$map.getInteractions()

      return {
        hasInteraction (interaction) {
          return interactions.getArray().includes(interaction)
        },
        addInteraction (interaction) {
          map.addInteraction(interaction)
        },
        removeInteraction (interaction) {
          map.removeInteraction(interaction)
        },
      }
    },
    /**
     * @return {{
     *     addFeature: function(ol.Feature): void,
     *     removeFeature: function(ol.Feature): void,
     *     hasFeature: function(ol.Feature): bool
     *   }|undefined}
     * @protected
     */
    getFeaturesTarget () {
      const source = this._defaultLayer.getSource()

      return {
        hasFeature (feature) {
          return source.getFeatureById(feature.getId()) != null
        },
        addFeature (feature) {
          source.addFeature(feature)
        },
        removeFeature (feature) {
          source.removeFeature(feature)
        },
      }
    },
    /**
     * @return {{
     *     hasOverlay: function(ol.Overlay): bool,
     *     addOverlay: function(ol.Overlay): void,
     *     removeOverlay: function(ol.Overlay): void
     *   }|undefined}
     * @protected
     */
    getOverlaysTarget () {
      if (!this.$map) return

      const map = this.$map
      const overlays = this.$map.getOverlays()

      return {
        hasOverlay (interaction) {
          return overlays.getArray().includes(interaction)
        },
        addOverlay (interaction) {
          map.addOverlay(interaction)
        },
        removeOverlay (interaction) {
          map.removeOverlay(interaction)
        },
      }
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
        this::olCmp.methods.getServices(),
        this::layersContainer.methods.getServices(),
        this::interactionsContainer.methods.getServices(),
        this::overlaysContainer.methods.getServices(),
        this::featuresContainer.methods.getServices(),
        {
          get map () { return vm.$map },
          get view () { return vm.$view },
          get viewContainer () { return vm },
        }
      )
    },
    /**
     * Triggers focus on map container.
     * @return {void}
     */
    focus () {
      this.$el.focus()
    },
    /**
     * @param {number[]} pixel
     * @param {function((ol.Feature|ol.render.Feature), ?ol.layer.Layer): *} callback
     * @param {Object} [opts]
     * @return {*|undefined}
     */
    forEachFeatureAtPixel (pixel, callback, opts = {}) {
      assert.hasMap(this)

      return this.$map.forEachFeatureAtPixel(pixel, callback, opts)
    },
    /**
     * @param {number[]} pixel
     * @param {function(ol.layer.Layer, ?(number[]|Uint8Array)): *} callback
     * @param {function(ol.layer.Layer): boolean} [layerFilter]
     * @return {*|undefined}
     */
    forEachLayerAtPixel (pixel, callback, layerFilter) {
      assert.hasMap(this)

      return this.$map.forEachLayerAtPixel(pixel, callback, undefined, layerFilter)
    },
    /**
     * @param {ol.View|Vue|undefined} view
     * @return {void}
     * @protected
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
      this.$map.setTarget(this.$el)
      this.subscribeAll()
      this.updateSize()
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
     * Updates map size and re-renders map.
     * @return {Promise}
     */
    refresh () {
      this.updateSize()
      return this.render()
    },
    /**
     * @return {Promise}
     */
    render () {
      return new Promise(resolve => {
        assert.hasMap(this)

        this.$map.once('postrender', () => resolve())
        this.$map.render()
      })
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToMapEvents()
    },
    /**
     * Updates map size.
     * @return {void}
     */
    updateSize () {
      assert.hasMap(this)
      this.$map.updateSize()
    },
  }

  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   *
   * @title vl-map
   * @alias module:map/map
   * @vueProto
   *
   * @fires module:map/map#click
   * @fires module:map/map#dblclick
   * @fires module:map/map#singleclick
   * @fires module:map/map#pointerdrag
   * @fires module:map/map#pointermove
   * @fires module:map/map#movestart
   * @fires module:map/map#moveend
   * @fires module:map/map#postrender
   * @fires module:map/map#precompose
   * @fires module:map/map#postcompose
   *
   * @vueSlot default Default slot for all child components.
   */
  export default {
    name: 'vl-map',
    mixins: [olCmp, layersContainer, interactionsContainer, overlaysContainer, featuresContainer],
    props,
    methods,
    /**
     * @this module:map/map
     */
    created () {
      /**
       * @type {ol.View|undefined}
       * @private
       */
      this._view = undefined
      /**
       * @type {ol.layer.Vector}
       * @private
       */
      this._defaultLayer = new VectorLayer({
        source: new VectorSource(),
      })

      Object.defineProperties(this, /** @lends module:map/map# */{
        /**
         * OpenLayers map instance.
         * @type {ol.Map|undefined}
         */
        $map: {
          enumerable: true,
          get: () => this.$olObject,
        },
        /**
         * OpenLayers view instance.
         * @type {ol.View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this._view,
        },
      })
    },
    /**
     * @this module:map/map
     */
    destroyed () {
      this._view = undefined
    },
  }

  /**
   * Subscribe to OL map events.
   *
   * @this module:map/map
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    assert.hasMap(this)
    assert.hasView(this)

    const ft = 100
    // pointer
    const pointerEvents = Observable::mergeObs(
      observableFromOlEvent(this.$map, [
        'click',
        'dblclick',
        'singleclick',
      ]),
      observableFromOlEvent(this.$map, [
        'pointerdrag',
        'pointermove',
      ])::throttleTime(ft)
        ::distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate))
    )::mapObs(evt => ({
      ...evt,
      coordinate: projHelper.toLonLat(evt.coordinate, this.$view.getProjection()),
    }))
    // other
    const otherEvents = observableFromOlEvent(this.$map, [
      'movestart',
      'moveend',
      'postrender',
      'precompose',
      'postcompose',
    ])

    const events = Observable::mergeObs(
      pointerEvents,
      otherEvents
    )

    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }

  /**
   * A click with no dragging. A double click will fire two of this.
   * @event module:map/map#click
   * @type {ol.MapBrowserEvent}
   */
  /**
   * A true double click, with no dragging.
   * @event module:map/map#dblclick
   * @type {ol.MapBrowserEvent}
   */
</script>
