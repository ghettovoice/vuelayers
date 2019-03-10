<template>
  <div :class="[$options.name]" :tabindex="tabindex">
    <slot/>
  </div>
</template>

<script>
  import { defaults as createDefaultControls } from 'ol/control'
  import { defaults as createDefaultInteractions } from 'ol/interaction'
  import VectorLayer from 'ol/layer/Vector'
  import Collection from 'ol/Collection'
  import Map from 'ol/Map'
  import WebGLMap from 'ol/WebGLMap'
  import VectorSource from 'ol/source/Vector'
  import View from 'ol/View'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
  import Vue from 'vue'
  import { olCmp, overlaysContainer, layersContainer, interactionsContainer, featuresContainer } from '../../mixin'
  import projTransforms from '../../mixin/proj-transforms'
  import { RENDERER_TYPE, getFeatureId, IndexedCollectionAdapter } from '../../ol-ext'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasMap, hasView } from '../../util/assert'
  import { isEqual } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  const props = {
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
      default: () => window.devicePixelRatio || 1,
    },
    /**
     * Renderer. By default, **Canvas** and **WebGL** renderers are tested for support in that order,
     * and the first supported used. **Note** that the **Canvas** renderer fully supports vector data,
     * but **WebGL** can only render **Point** geometries.
     * @type {string|string[]}
     * @default ['canvas', 'webgl']
     */
    renderer: {
      type: String,
      default: RENDERER_TYPE.CANVAS,
      validator: value => Object.values(RENDERER_TYPE).includes(value),
    },
    /**
     * Root element `tabindex` attribute value. Value should be provided to allow keyboard events on map.
     * @type {number|string}
     */
    tabindex: [String, Number],
    /**
     * Projection for input/output coordinates in plain data.
     * @type {string}
     */
    dataProjection: String,
    wrapX: {
      type: Boolean,
      default: true,
    },
  }

  const computed = {
    mapCtor () {
      switch (this.renderer) {
        case RENDERER_TYPE.WEBGL:
          return WebGLMap
        case RENDERER_TYPE.CANVAS:
        default:
          return Map
      }
    },
  }

  const methods = {
    /**
     * @return {Map}
     * @protected
     */
    createOlObject () {
      /* eslint-disable-next-line new-cap */
      const map = new this.mapCtor({
        loadTilesWhileAnimating: this.loadTilesWhileAnimating,
        loadTilesWhileInteracting: this.loadTilesWhileInteracting,
        pixelRatio: this.pixelRatio,
        moveTolerance: this.moveTolerance,
        keyboardEventTarget: this.keyboardEventTarget,
        controls: this._controls,
        interactions: this._interactions,
        layers: this._layers,
        overlays: this._overlays,
        view: this._view,
      })
      map.set('dataProjection', this.dataProjection)
      this._defaultOverlay.setMap(map)

      return map
    },
    /**
     * @return {IndexedCollectionAdapter}
     * @protected
     */
    getLayersTarget () {
      hasMap(this)

      if (this._layersTarget == null) {
        this._layersTarget = new IndexedCollectionAdapter(
          this.$map.getLayers(),
          layer => layer.get('id'),
        )
      }

      return this._layersTarget
    },
    /**
     * @return {IndexedCollectionAdapter}
     * @protected
     */
    getInteractionsTarget () {
      hasMap(this)

      if (this._interactionsTarget == null) {
        this._interactionsTarget = new IndexedCollectionAdapter(
          this.$map.getInteractions(),
          interaction => interaction.get('id'),
        )
      }

      return this._interactionsTarget
    },
    /**
     * @return {function}
     * @protected
     */
    getDefaultInteractionsSorter () {
      // sort interactions by priority in asc order
      // the higher the priority, the earlier the interaction handles the event
      return (a, b) => {
        let ap = a.get('priority') || 0
        let bp = b.get('priority') || 0
        return ap === bp ? 0 : ap - bp
      }
    },
    /**
     * @return {SourceCollectionAdapter}
     * @protected
     */
    getFeaturesTarget () {
      if (this._featuresTarget == null) {
        this._featuresTarget = new IndexedCollectionAdapter(
          this._defaultOverlayFeatures,
          feature => getFeatureId(feature)
        )
      }

      return this._featuresTarget
    },
    /**
     * @return {IndexedCollectionAdapter}
     * @protected
     */
    getOverlaysTarget () {
      hasMap(this)

      if (this._overlaysTarget == null) {
        this._overlaysTarget = new IndexedCollectionAdapter(
          this.$map.getOverlays(),
          overlay => overlay.getId(),
        )
      }

      return this._overlaysTarget
    },
    /**
     * @param {number[]} pixel
     * @return {number[]} Coordinates in the map view projection.
     */
    getCoordinateFromPixel (pixel) {
      hasMap(this)

      let coordinate = this.$map.getCoordinateFromPixel(pixel)
      return this.pointToDataProj(coordinate)
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
        },
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
     * @param {function((Feature), ?Layer): *} callback
     * @param {Object} [opts]
     * @return {*|undefined}
     */
    forEachFeatureAtPixel (pixel, callback, opts = {}) {
      hasMap(this)
      return this.$map.forEachFeatureAtPixel(pixel, callback, opts)
    },
    /**
     * @param {number[]} pixel
     * @param {function(Layer, ?(number[]|Uint8Array)): *} callback
     * @param {function(Layer): boolean} [layerFilter]
     * @return {*|undefined}
     */
    forEachLayerAtPixel (pixel, callback, layerFilter) {
      hasMap(this)
      return this.$map.forEachLayerAtPixel(pixel, callback, undefined, layerFilter)
    },
    /**
     * @param {View|Vue|undefined} view
     * @return {void}
     * @protected
     */
    setView (view) {
      view = view instanceof Vue ? view.$view : view
      view || (view = new View())

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
      hasMap(this)
      this.$map.setTarget(this.$el)
      this.subscribeAll()
      this.updateSize()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      hasMap(this)

      this.clearLayers()
      this.clearInteractions()
      this.clearOverlays()

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
        .then(() => this::olCmp.methods.refresh())
    },
    /**
     * @return {Promise}
     */
    render () {
      return new Promise(resolve => {
        hasMap(this)
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
      hasMap(this)
      this.$map.updateSize()
    },
  }

  const watch = {
    ...makeWatchers([
      'keyboardEventTarget',
      'loadTilesWhileAnimating',
      'loadTilesWhileInteracting',
      'moveTolerance',
      'pixelRatio',
      'renderer',
    ], () => olCmp.methods.scheduleRecreate),
    controls (value) {
      if (value === false) {
        this._controls.clear()
        return
      }

      value = typeof value === 'object' ? value : undefined
      this._controls.clear()
      this._controls.extend(createDefaultControls(value).getArray())
    },
    wrapX (value) {
      if (this._defaultOverlay != null) {
        let source = new VectorSource({
          features: this._defaultOverlayFeatures,
          wrapX: value,
        })
        this._defaultOverlay.setSource(source)
      }
    },
    dataProjection (value) {
      if (this.$map) {
        this.$map.set('dataProjection', value)
        this.scheduleRefresh()
      }
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
    mixins: [
      olCmp,
      layersContainer,
      interactionsContainer,
      overlaysContainer,
      featuresContainer,
      projTransforms,
    ],
    props,
    computed,
    methods,
    watch,
    created () {
      this._view = new View()
      this._controls = this.controls !== false
        ? createDefaultControls(typeof this.controls === 'object' ? this.controls : undefined)
        : new Collection()
      this._interactions = createDefaultInteractions()
      this._layers = new Collection()
      this._overlays = new Collection()
      // prepare default overlay
      this._defaultOverlayFeatures = new Collection()
      this._defaultOverlay = new VectorLayer({
        source: new VectorSource({
          features: this._defaultOverlayFeatures,
          wrapX: this.wrapX,
        }),
      })

      Object.defineProperties(this, /** @lends module:map/map# */{
        /**
         * OpenLayers map instance.
         * @type {Map|undefined}
         */
        $map: {
          enumerable: true,
          get: () => this.$olObject,
        },
        /**
         * OpenLayers view instance.
         * @type {View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this._view,
        },
      })
    },
  }

  /**
   * Subscribe to OL map events.
   *
   * @return {void}
   * @private
   */
  function subscribeToMapEvents () {
    hasMap(this)
    hasView(this)

    const ft = 100
    // pointer
    const pointerEvents = mergeObs(
      observableFromOlEvent(this.$map, [
        'click',
        'dblclick',
        'singleclick',
      ]),
      observableFromOlEvent(this.$map, [
        'pointerdrag',
        'pointermove',
      ]).pipe(
        throttleTime(ft),
        distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate)),
      ),
    ).pipe(
      mapObs(evt => ({
        ...evt,
        coordinate: this.pointToDataProj(evt.coordinate),
      })),
    )
    // other
    const otherEvents = observableFromOlEvent(this.$map, [
      'movestart',
      'moveend',
      'postrender',
      'rendercomplete',
      'precompose',
      'postcompose',
    ])

    const events = mergeObs(pointerEvents, otherEvents)

    this.subscribeTo(events, evt => this.$emit(evt.type, evt))
  }

  /**
   * A click with no dragging. A double click will fire two of this.
   * @event module:map/map#click
   * @type {MapBrowserEvent}
   */
  /**
   * A true double click, with no dragging.
   * @event module:map/map#dblclick
   * @type {MapBrowserEvent}
   */
</script>
