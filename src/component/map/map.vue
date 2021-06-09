<template>
  <div :id="vmId" :class="cmpName" :tabindex="tabindex">
    <slot/>
  </div>
</template>

<script>
  import Collection from 'ol/Collection'
  import { defaults as createDefaultControls } from 'ol/control'
  import { defaults as createDefaultInteractions } from 'ol/interaction'
  import VectorLayer from 'ol/layer/Vector'
  import Map from 'ol/Map'
  import VectorSource from 'ol/source/Vector'
  import View from 'ol/View'
  import WebGLMap from 'ol/WebGLMap'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilChanged, map as mapObs } from 'rxjs/operators'
  import Vue from 'vue'
  import {
    featuresContainer,
    interactionsContainer,
    layersContainer,
    olCmp,
    overlaysContainer,
    projTransforms,
  } from '../../mixin'
  import { getMapId, initializeInteraction, setMapDataProjection, setMapId } from '../../ol-ext'
  import { observableFromOlEvent } from '../../rx-ext'
  import { hasMap, hasView } from '../../util/assert'
  import { isEqual, isPlainObject } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
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
    props: {
      /**
       * Options for default controls added to the map by default. Set to `false` to disable all map controls. Object
       * value is used to configure controls.
       * @type {Object|boolean|Collection}
       * @todo remove when vl-control-* components will be ready
       */
      defaultControls: {
        type: [Object, Boolean, Collection],
        default: true,
      },
      /**
       * Options for default interactions added to the map by default. Object
       * value is used to configure default interactions.
       * @type {Object|boolean|Collection}
       */
      defaultInteractions: {
        type: [Object, Boolean, Collection],
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
       * Maximum number tiles to load simultaneously.
       * @type {number}
       */
      maxTilesLoading: {
        type: Number,
        default: 16,
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
      /**
       * @type {boolean}
       */
      wrapX: {
        type: Boolean,
        default: true,
      },
      renderer: {
        type: String,
        default: 'canvas',
        validator: val => ['canvas', 'webgl'].includes(val),
      },
    },
    computed: {
      controlsCollectionIdent () {
        if (!this.olObjIdent) return

        return this.makeIdent(this.olObjIdent, 'controls_collection')
      },
    },
    methods: {
      /**
       * @return {module:ol/PluggableMap~PluggableMap}
       * @protected
       */
      createOlObject () {
        let Ctor
        switch (this.renderer) {
          case 'webgl':
            Ctor = WebGLMap
            break
          case 'canvas':
          default:
            Ctor = Map
        }

        const map = new Ctor({
          loadTilesWhileAnimating: this.loadTilesWhileAnimating,
          loadTilesWhileInteracting: this.loadTilesWhileInteracting,
          pixelRatio: this.pixelRatio,
          moveTolerance: this.moveTolerance,
          keyboardEventTarget: this.keyboardEventTarget,
          maxTilesLoading: this.maxTilesLoading,
          controls: this._controlsCollection,
          interactions: this.$interactionsCollection,
          layers: this.$layersCollection,
          overlays: this.$overlaysCollection,
          view: this.$view,
        })

        setMapId(map, this.id)
        setMapDataProjection(map, this.dataProjection)
        this._featuresOverlay.setMap(map)

        return map
      },
      /**
       * @param {number[]} pixel
       * @return {number[]} Coordinates in the map data projection.
       */
      getCoordinateFromPixel (pixel) {
        hasMap(this)

        let coordinate = this.$map.getCoordinateFromPixel(pixel)

        return this.pointToDataProj(coordinate)
      },
      /**
       * @param {number[]} coordinate Coordinates in map data projection
       * @return {number[]}
       */
      getPixelFromCoordinate (coordinate) {
        hasMap(this)

        return this.$map.getPixelFromCoordinate(this.pointToViewProj(coordinate))
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
       * @param {function} callback
       * @param {Object} [opts]
       * @return {*|undefined}
       */
      forEachFeatureAtPixel (pixel, callback, opts = {}) {
        hasMap(this)

        return this.$map.forEachFeatureAtPixel(pixel, callback, opts)
      },
      /**
       * @param {number[]} pixel
       * @param {function} callback
       * @param {Object} [opts]
       * @return {*|undefined}
       */
      forEachLayerAtPixel (pixel, callback, opts = {}) {
        hasMap(this)

        return this.$map.forEachLayerAtPixel(pixel, callback, opts)
      },
      /**
       * @param {number[]} pixel
       * @param {Object} [opts]
       */
      getFeaturesAtPixel (pixel, opts = {}) {
        hasMap(this)

        return this.$map.getFeaturesAtPixel(pixel, opts)
      },
      /**
       * Updates map size and re-renders map.
       * @return {Promise}
       */
      refresh () {
        this.updateSize()

        return this.render().then(() => this::olCmp.methods.refresh())
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
       * Updates map size.
       * @return {void}
       */
      updateSize () {
        hasMap(this)

        this.$map.updateSize()
      },
      /**
       * @param {module:ol/View~View|Vue|undefined} view
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
       * @return {module:ol/View~View}
       */
      getView () {
        return this._view
      },
      /**
       * @return {void}
       * @protected
       */
      mount () {
        hasMap(this)

        this.$map.setTarget(this.$el)
        this.$nextTick(::this.updateSize)

        this.subscribeAll()
      },
      /**
       * @return {void}
       * @protected
       */
      unmount () {
        hasMap(this)

        this.unsubscribeAll()
        this.$map.setTarget(null)
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::subscribeToEvents()
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
    },
    watch: {
      ...makeWatchers([
        'keyboardEventTarget',
        'loadTilesWhileAnimating',
        'loadTilesWhileInteracting',
        'moveTolerance',
        'pixelRatio',
        'renderer',
        'maxTilesLoading',
      ], () => function () {
        this.scheduleRecreate()
      }),
      id (value) {
        if (!this.$map || value === getMapId(this.$map)) {
          return
        }

        setMapId(this.$map, value)
      },
      defaultControls: {
        deep: true,
        handler (value) {
          this._controlsCollection.getArray().slice().forEach(control => {
            if (control.get('vl_default')) {
              this._controlsCollection.remove(control)
            }
          })
          if (value === false) {
            return
          }
          value = typeof value === 'object' ? value : undefined
          this._controlsCollection.extend(createDefaultControls(value).getArray().map(control => {
            control.set('vl_default', true)
            return control
          }))
        },
      },
      defaultInteractions: {
        deep: true,
        handler (value) {
          this._interactionsCollection.getArray().slice().forEach(interaction => {
            if (interaction.get('vl_default')) {
              this._interactionsCollection.remove(interaction)
            }
          })
          if (value === false) {
            return
          }
          value = typeof value === 'object' ? value : undefined
          this._interactionsCollection.extend(createDefaultInteractions(value).getArray().map(interaction => {
            interaction.set('vl_default', true)
            return interaction
          }))
          console.log(this._interactionsCollection.getArray().slice())
        },
      },
      wrapX (value) {
        if (this._featuresOverlay == null) return

        this._featuresOverlay.setSource(new VectorSource({
          features: this.$featuresCollection,
          wrapX: value,
        }))
      },
      dataProjection (value) {
        if (!this.$map) return

        setMapDataProjection(this.$map, value)
        this.scheduleRefresh()
      },
    },
    created () {
      this._view = new View({
        center: [0, 0],
        zoom: 0,
      })
      // todo make controls handling like with interactions
      this._controlsCollection = this.instanceFactoryCall(this.controlsCollectionIdent, () => new Collection())
      if (this.defaultControls instanceof Collection) {
        this._controlsCollection = this.defaultControls
      } else if (this.defaultControls !== false) {
        this._controlsCollection = createDefaultControls(
          isPlainObject(this.defaultControls)
            ? this.defaultControls
            : undefined,
        )
      }
      this._controlsCollection.forEach(control => {
        control.set('vl_default', true)
      })
      // todo initialize without interactions and provide vl-interaction-default component
      if (this.defaultInteractions instanceof Collection) {
        this._interactionsCollection = this.defaultInteractions
      } else if (this.defaultInteractions !== false) {
        this._interactionsCollection = createDefaultInteractions(
          isPlainObject(this.defaultInteractions)
            ? this.defaultInteractions
            : undefined,
        )
      }
      this._interactionsCollection.forEach(interaction => {
        interaction = initializeInteraction(interaction)
        interaction.set('vl_default', true)
      })
      // prepare default overlay
      this._featuresOverlay = new VectorLayer({
        source: new VectorSource({
          features: this.$featuresCollection,
          wrapX: this.wrapX,
        }),
      })

      this::defineServices()
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * OpenLayers map instance.
       * @type {module:ol/PluggableMap~PluggableMap|undefined}
       */
      $map: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * OpenLayers view instance.
       * @type {module:ol/View~View}
       */
      $view: {
        enumerable: true,
        get: this.getView,
      },
    })
  }

  /**
   * Subscribe to OL map events.
   *
   * @return {void}
   * @private
   */
  function subscribeToEvents () {
    hasMap(this)
    hasView(this)

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
        distinctUntilChanged((a, b) => isEqual({
          t: a.type,
          c: a.coordinate,
        }, {
          t: b.type,
          c: b.coordinate,
        })),
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
      'rendercomplete',
    ])

    const events = mergeObs(pointerEvents, otherEvents)

    this.subscribeTo(events, evt => {
      this.$emit(evt.type, evt)
    })
  }
</script>
