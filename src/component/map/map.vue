<template>
  <div
    :id="vmId"
    :class="vmClass"
    :tabindex="tabindex">
    <slot />
  </div>
</template>

<script>
  import { Collection, Map, View } from 'ol'
  import { Vector as VectorLayer } from 'ol/layer'
  import { get as getProj } from 'ol/proj'
  import { Vector as VectorSource } from 'ol/source'
  import { merge as mergeObs } from 'rxjs'
  import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operators'
  import {
    controlsContainer,
    featuresContainer,
    interactionsContainer,
    layersContainer,
    olCmp,
    overlaysContainer,
    projTransforms,
  } from '../../mixin'
  import { getMapDataProjection, getMapId, setMapDataProjection, setMapId } from '../../ol-ext'
  import { obsFromOlEvent } from '../../rx-ext'
  import { assert } from '../../util/assert'
  import { isEqual, isFunction } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   *
   * todo make render function that injects VlView if it is not provided by the user,
   *      then it can be provided to lower components
   */
  export default {
    name: 'VlMap',
    mixins: [
      projTransforms,
      layersContainer,
      controlsContainer,
      interactionsContainer,
      overlaysContainer,
      featuresContainer,
      olCmp,
    ],
    props: {
      /**
       * Options for default controls added to the map by default. Set to `false` to disable all map controls. Object
       * value is used to configure controls.
       * @type {Object|boolean|Array<module:ol/control/Control~Control>|Collection<module:ol/control/Control~Control>}
       * @todo remove when vl-control-* components will be ready
       */
      defaultControls: {
        type: [Object, Boolean, Array, Collection],
        default: true,
      },
      /**
       * Options for default interactions added to the map by default. Object
       * value is used to configure default interactions.
       * @type {Object|boolean|Array<module:ol/interaction/Interaction~Interaction>|Collection<module:ol/interaction/Interaction~Interaction>}
       */
      defaultInteractions: {
        type: [Object, Boolean, Array, Collection],
        default: true,
      },
      /**
       * The element to listen to keyboard events on. For example, if this option is set to `document` the keyboard
       * interactions will always trigger. If this option is not specified, the element the library listens to keyboard
       * events on is the component root element.
       * @type {string|Element|Document|undefined}
       */
      keyboardEventTarget: [String, Element, Document],
      /**
       * The minimum distance in pixels the cursor must move to be detected as a map move event instead of a click.
       * Increasing this value can make it easier to click on the map.
       * @type {number}
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
       * @type {string|undefined}
       */
      dataProjection: {
        type: String,
        validator: value => getProj(value) != null,
      },
      /**
       * @type {boolean}
       */
      wrapX: {
        type: Boolean,
        default: true,
      },
      updateWhileAnimating: Boolean,
      updateWhileInteracting: Boolean,
    },
    computed: {
      /**
       * @return {string|undefined}
       */
      featuresOverlayIdent () {
        if (!this.olObjIdent) return

        return this.makeIdent(this.olObjIdent, 'features_overlay')
      },
    },
    watch: {
      async id (value) {
        await this.setId(value)
      },
      async defaultControls (value) {
        await this.initDefaultControls(value)
      },
      async defaultInteractions (value) {
        await this.initDefaultInteractions(value)
      },
      wrapX (value) {
        this.setWrapX(value)
      },
      async dataProjection (value) {
        await this.setDataProjection(value)
      },
      ...makeWatchers([
        'keyboardEventTarget',
        'moveTolerance',
        'pixelRatio',
        'maxTilesLoading',
      ], prop => function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`watcher for ${prop} triggered`)
        }

        return this.scheduleRecreate()
      }),
    },
    created () {
      this::defineServices()
    },
    methods: {
      /**
       * @return {module:ol/Map~Map}
       * @protected
       */
      createOlObject () {
        // prepare default overlay
        this._featuresOverlay = this.instanceFactoryCall(this.featuresOverlayIdent, ::this.createFeaturesOverlay)
        // todo wrap controls into components and provide vl-control-default
        this.initDefaultControls(this.defaultControls)
        // todo initialize without interactions and provide vl-interaction-default component
        this.initDefaultInteractions(this.defaultInteractions)

        const map = new Map({
          pixelRatio: this.pixelRatio,
          moveTolerance: this.moveTolerance,
          keyboardEventTarget: this.keyboardEventTarget,
          maxTilesLoading: this.maxTilesLoading,
          controls: this.$controlsCollection,
          interactions: this.$interactionsCollection,
          layers: this.$layersCollection,
          overlays: this.$overlaysCollection,
          view: new View({
            center: [0, 0],
            zoom: 0,
          }),
        })
        setMapId(map, this.id)
        setMapDataProjection(map, this.dataProjection)

        this._featuresOverlay.setMap(map)

        return map
      },
      /**
       * @return {Promise<string|number>}
       */
      async getId () {
        return getMapId(await this.resolveMap())
      },
      /**
       * @param {string|number} id
       * @return {Promise<void>}
       */
      async setId (id) {
        const map = this.resolveMap()

        if (id === getMapId(map)) return

        setMapId(map, id)
      },
      /**
       * @param {number[]} pixel
       * @param {function} callback
       * @param {Object} [opts]
       * @return {Promise}
       */
      async forEachFeatureAtPixel (pixel, callback, opts = {}) {
        return (await this.resolveMap()).forEachFeatureAtPixel(pixel, callback, opts)
      },
      /**
       * @param {number[]} pixel
       * @param {function} callback
       * @param {Object} [opts]
       * @return {Promise}
       */
      async forEachLayerAtPixel (pixel, callback, opts = {}) {
        return (await this.resolveMap()).forEachLayerAtPixel(pixel, callback, opts)
      },
      /**
       * @param {number[]} pixel
       * @return {Promise<number[]>} Coordinates in the map view projection.
       */
      async getCoordinateFromPixel (pixel) {
        return this.pointToDataProj((await this.resolveMap()).getCoordinateFromPixel(pixel))
      },
      /**
       * @param {Event} event
       * @return {Promise<number[]>}
       */
      async getEventCoordinate (event) {
        return this.pointToDataProj((await this.resolveMap()).getEventCoordinate(event))
      },
      /**
       * @param {Event} event
       * @return {Promise<number[]>}
       */
      async getEventPixel (event) {
        return (await this.resolveMap()).getEventPixel(event)
      },
      /**
       * @param {number[]} pixel
       * @param {Object} [opts]
       * @return {Promise}
       */
      async getFeaturesAtPixel (pixel, opts = {}) {
        return (await this.resolveMap()).getFeaturesAtPixel(pixel, opts)
      },
      /**
       * @param {number[]} pixel
       * @param {Object} [options]
       * @return {Promise<boolean>}
       */
      async hasFeatureAtPixel (pixel, options = {}) {
        return (await this.resolveMap()).hasFeatureAtPixel(pixel, options)
      },
      /**
       * @param {number[]} coordinate Coordinates in map view projection
       * @return {Promise<number[]>}
       */
      async getPixelFromCoordinate (coordinate) {
        return (await this.resolveMap()).getPixelFromCoordinate(this.pointToViewProj(coordinate))
      },
      /**
       * @return {Promise<number[]>}
       */
      async getSize () {
        return (await this.resolveMap()).getSize()
      },
      /**
       * @return {Promise<void>}
       */
      async setSize (size) {
        const map = await this.resolveMap()

        if (isEqual(size, map.getSize())) return

        map.setSize(size)
      },
      /**
       * Updates map size.
       * @return {Promise<void>}
       */
      async updateSize () {
        (await this.resolveMap()).updateSize()
      },
      /**
       * @return {Promise<void>}
       */
      async render () {
        const map = await this.resolveMap()

        return new Promise(resolve => {
          map.once('postrender', () => resolve())
          map.render()
        })
      },
      /**
       * @return {Promise<void>}
       */
      async renderSync () {
        (await this.resolveMap()).renderSync()
      },
      /**
       * @return {Promise<HTMLElement>}
       */
      async getTarget () {
        return (await this.resolveMap()).getTarget()
      },
      /**
       * @param {HTMLElement} target
       * @return {Promise<void>}
       */
      async setTarget (target) {
        const map = await this.resolveMap()

        if (target === map.getTarget()) return

        map.setTarget(target)
      },
      /**
       * @return {Promise<HTMLElement>}
       */
      async getTargetElement () {
        return (await this.resolveMap()).getTargetElement()
      },
      /**
       * @return {Promise<HTMLElement>}
       */
      async getViewport () {
        return (await this.resolveMap()).getViewport()
      },
      /**
       * @return {module:ol/View~View}
       */
      async getView () {
        return (await this.resolveMap()).getView()
      },
      /**
       * @param {module:ol/View~View|Vue|undefined} view
       * @return {Promise<void>}
       */
      async setView (view) {
        if (view && isFunction(view.resolveOlObject)) {
          view = await view.resolveOlObject()
        }
        view || (view = new View({ center: [0, 0], zoom: 0 }))

        const map = await this.resolveMap()
        if (view !== map.getView()) {
          map.setView(view)
        }
      },
      /**
       * @return {Promise<module:ol/proj~ProjectionLike|undefined>}
       */
      async getDataProjection () {
        return getMapDataProjection(await this.resolveMap())
      },
      /**
       * @param {module:ol/proj~ProjectionLike} projection
       * @return {Promise<void>}
       */
      async setDataProjection (projection) {
        assert(getProj(projection) != null, 'Map data projection is registered')

        const map = await this.resolveMap()

        if (projection === getMapDataProjection(map)) return

        setMapDataProjection(map, projection)
        await this.scheduleRefresh()
      },
      /**
       * @return {boolean}
       */
      getWrapX () {
        if (!this.$featuresOverlaySource) return false

        return this.$featuresOverlaySource.getWrapX()
      },
      /**
       * @param {boolean} wrapX
       * @return {void}
       */
      setWrapX (wrapX) {
        if (this.$featuresOverlaySource == null) return

        if (wrapX === this.$featuresOverlaySource.getWrapX()) return

        const layer = this.createFeaturesOverlay({ wrapX })
        this.$featuresOverlay.setSource(layer.getSource())
      },
      /**
       * Triggers focus on map container.
       * @return {void}
       */
      focus () {
        this.$el.focus()
      },
      /**
       * Updates map size and re-renders map.
       * @return {Promise}
       */
      async refresh () {
        await this.updateSize()
        await this.render()

        return this::olCmp.methods.refresh()
      },
      /**
       * @return {void}
       * @protected
       */
      async mount () {
        await this.setTarget(this.$el)
        this.$nextTick(::this.updateSize)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        await this.setTarget(null)

        return this::olCmp.methods.unmount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async subscribeAll () {
        await Promise.all([
          this::olCmp.methods.subscribeAll(),
          this::subscribeToEvents(),
        ])
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
            get mapVm () { return vm },
            get viewContainer () { return vm },
          },
        )
      },
      /**
       * @param {module:ol/layer/BaseVector~Options} sourceOptions
       * @return {VectorLayer<VectorSource>}
       */
      createFeaturesOverlay (sourceOptions = {}) {
        sourceOptions = {
          features: this.$featuresCollection,
          wrapX: this.wrapX,
          ...sourceOptions,
        }

        return new VectorLayer({
          source: new VectorSource(sourceOptions),
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
        })
      },
      /**
       * @return {Promise<module:ol/Map~Map>}
       */
      resolveMap: olCmp.methods.resolveOlObject,
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * OpenLayers map instance.
       * @type {module:ol/Map~Map|undefined}
       */
      $map: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * @type {module:ol/View~View|undefined}
       */
      $view: {
        enumerable: true,
        get: () => this.$map?.getView(),
      },
      /**
       * @type {module:ol/layer/Vector~VectorLayer|undefined}
       */
      $featuresOverlay: {
        enumerable: true,
        get: () => this._featuresOverlay,
      },
      /**
       * @type {module:ol/source/Vector~VectorSource|undefined}
       */
      $featuresOverlaySource: {
        enumerable: true,
        get: () => this.$featuresOverlay?.getSource(),
      },
    })
  }

  /**
   * Subscribe to OL map events.
   *
   * @return {void}
   * @private
   */
  async function subscribeToEvents () {
    const map = await this.resolveMap()

    const ft = 1000 / 60
    // pointer
    const pointerEvents = mergeObs(
      obsFromOlEvent(map, [
        'click',
        'dblclick',
        'singleclick',
      ]),
      obsFromOlEvent(map, [
        'pointerdrag',
        'pointermove',
      ]).pipe(
        throttleTime(ft),
        distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate)),
      ),
    ).pipe(
      mapObs(evt => {
        evt.coordinate = this.pointToDataProj(evt.coordinate)
        return evt
      }),
    )
    // other
    const otherEvents = obsFromOlEvent(map, [
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
