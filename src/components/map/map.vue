<template>
  <div
    :id="vmId"
    :class="vmClass"
    :tabindex="tabindex">
    <slot />
    <ViewCmp
      v-if="!withCustomView"
      :id="'vl-' + currentId + '-default-view'"
      ref="view" />
    <VectorLayerCmp
      :id="'vl-' + currentId + '-default-layer'"
      ref="featuresOverlay"
      :overlay="true"
      :update-while-animating="updateWhileAnimating"
      :update-while-interacting="updateWhileInteracting">
      <VectorSourceCmp
        :id="'vl-' + currentId + '-default-source'"
        ref="featuresOverlaySource"
        :wrap-x="wrapX"
        :projection="currentDataProjection"
        @created="featuresOverlaySourceCreated">
        <slot name="overlay" />
      </VectorSourceCmp>
    </VectorLayerCmp>
  </div>
</template>

<script>
  import { Map, View } from 'ol'
  import MapBrowserEventType from 'ol/MapBrowserEventType'
  import MapEventType from 'ol/MapEventType'
  import { get as getProj } from 'ol/proj'
  import RenderEventType from 'ol/render/EventType'
  import { merge as mergeObs } from 'rxjs'
  import { distinctUntilChanged, map as mapObs, tap } from 'rxjs/operators'
  import {
    controlsContainer,
    featuresContainer,
    FRAME_TIME,
    interactionsContainer,
    layersContainer,
    makeChangeOrRecreateWatchers,
    olCmp,
    overlaysContainer,
    projTransforms,
  } from '../../mixins'
  import {
    EPSG_3857,
    getControlId,
    getInteractionId,
    getLayerId,
    getMapDataProjection,
    getMapId,
    getOverlayId,
    getViewId,
    roundPointCoords,
    setMapDataProjection,
    setMapId,
  } from '../../ol-ext'
  import {
    bufferDebounceTime,
    fromOlChangeEvent as obsFromOlChangeEvent,
    fromOlEvent as obsFromOlEvent,
    fromVueEvent as obsFromVueEvent,
    fromVueWatcher as obsFromVueWatcher,
  } from '../../rx-ext'
  import {
    addPrefix,
    assert,
    clonePlainObject,
    coalesce,
    isArray,
    isEqual,
    map,
    mergeDescriptors,
    omit,
  } from '../../utils'
  import { Layer as VectorLayerCmp } from '../vector-layer'
  import { Source as VectorSourceCmp } from '../vector-source'
  import ViewCmp from './view.vue'

  /**
   * Container for **layers**, **interactions**, **controls** and **overlays**. It responsible for viewport
   * rendering and low level interaction events.
   *
   * todo make render function that injects VlView if it is not provided by the user,
   *      then it can be provided to lower components
   */
  export default {
    name: 'VlMap',
    components: {
      ViewCmp,
      VectorLayerCmp,
      VectorSourceCmp,
    },
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
       * @type {Object|boolean}
       * @todo remove when vl-control-* components will be ready
       */
      defaultControls: {
        type: [Object, Boolean],
        default: true,
      },
      /**
       * Options for default interactions added to the map by default. Object
       * value is used to configure default interactions.
       * @type {Object|boolean}
       */
      defaultInteractions: {
        type: [Object, Boolean],
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
      /**
       * @type {boolean}
       */
      updateWhileAnimating: {
        type: Boolean,
        default: false,
      },
      /**
       * @type {boolean}
       */
      updateWhileInteracting: {
        type: Boolean,
        default: false,
      },
    },
    data () {
      return {
        viewProjection: EPSG_3857,
        withCustomView: false,
        size: undefined,
        currentDataProjection: this.dataProjection,
      }
    },
    computed: {
      resolvedDataProjection () {
        return coalesce(
          this.currentDataProjection,
          this.dataProjection,
          this.$options?.dataProjection,
          this.viewProjection,
        )
      },
      view () {
        if (!(this.rev && this.$view)) return

        return {
          id: getViewId(this.$view),
          type: this.$view.constructor.name,
        }
      },
      /**
       * @returns {string[]}
       */
      layers () {
        if (!this.rev) return []

        return map(this.getLayers(), layer => ({
          id: getLayerId(layer),
          type: layer.constructor.name,
        }))
      },
      /**
       * @returns {string[]}
       */
      controls () {
        if (!this.rev) return []

        return map(this.getControls(), control => ({
          id: getControlId(control),
          type: control.constructor.name,
        }))
      },
      /**
       * @returns {string[]}
       */
      interactions () {
        if (!this.rev) return []

        return map(this.getInteractions(), interaction => ({
          id: getInteractionId(interaction),
          type: interaction.constructor.name,
        }))
      },
      /**
       * @returns {string[]}
       */
      overlays () {
        if (!this.rev) return []

        return map(this.getOverlays(), overlay => ({
          id: getOverlayId(overlay),
          type: overlay.constructor.name,
        }))
      },
      /**
       * @type {Object[]}
       */
      featuresDataProj () {
        if (!this.rev) return []

        return map(this.getFeatures(), feature => this.writeFeatureInDataProj(feature))
      },
      /**
       * @type {Object[]}
       */
      featuresViewProj () {
        if (!this.rev) return []

        return map(this.getFeatures(), feature => this.writeFeatureInViewProj(feature))
      },
    },
    watch: {
      rev () {
        if (!this.$map) return

        if (!isEqual(this.size, this.$map.getSize())) {
          this.size = this.$map.getSize()
        }
      },
      size: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:size', value?.slice())
        },
      },
      defaultControls: {
        deep: true,
        handler (value) {
          this.initDefaultControls(value)
        },
      },
      defaultInteractions: {
        deep: true,
        handler (value) {
          this.initDefaultInteractions(value)
        },
      },
      dataProjection (value) {
        this.setDataProjection(value)
      },
      view: {
        deep: true,
        handler (value, prev) {
          if (value === prev) return

          this.$emit('update:view', value)
        },
      },
      layers: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:layers', value.slice())
        },
      },
      controls: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:controls', value.slice())
        },
      },
      interactions: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:interactions', value.slice())
        },
      },
      overlays: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:overlays', value.slice())
        },
      },
      featuresDataProj: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:features', clonePlainObject(value))
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'keyboardEventTarget',
        'moveTolerance',
        'pixelRatio',
        'maxTilesLoading',
      ]),
    },
    created () {
      /**
       * @type {module:ol/View~View}
       * @private
       */
      this._view = new View({
        center: [0, 0],
        zoom: 2,
      })
      /**
       * @type {Object|undefined}
       */
      this._viewVm = undefined

      this::defineServices()
      // todo wrap controls into components and provide vl-control-default
      this.initDefaultControls(this.defaultControls)
      // todo initialize without interactions and provide vl-interaction-default component
      this.initDefaultInteractions(this.defaultInteractions)
    },
    methods: {
      /**
       * @return {module:ol/Map~Map}
       * @protected
       */
      async createOlObject () {
        const map = new Map({
          pixelRatio: this.pixelRatio,
          moveTolerance: this.moveTolerance,
          keyboardEventTarget: this.keyboardEventTarget,
          maxTilesLoading: this.maxTilesLoading,
          controls: this.$controlsCollection,
          interactions: this.$interactionsCollection,
          layers: this.$layersCollection,
          overlays: this.$overlaysCollection,
          view: this.$view,
        })
        setMapId(map, this.currentId)
        setMapDataProjection(map, this.resolvedDataProjection)
        this.size && map.setSize(this.size)

        return map
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        this.setTarget(this.$el)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        this.setTarget(null)

        return this::olCmp.methods.unmount()
      },
      /**
       * @protected
       */
      subscribeAll () {
        this::olCmp.methods.subscribeAll()
        this::layersContainer.methods.subscribeAll()
        this::controlsContainer.methods.subscribeAll()
        this::interactionsContainer.methods.subscribeAll()
        this::overlaysContainer.methods.subscribeAll()
        this::featuresContainer.methods.subscribeAll()
        this::subscribeToEvents()

        // view projection can be changed in runtime only through vl-view vm
        this.subscribeTo(
          obsFromVueWatcher(this, () => this.$viewVm?.resolvedViewProjection),
          ({ value }) => { this.viewProjection = value || EPSG_3857 },
        )
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
          this::controlsContainer.methods.getServices(),
          this::interactionsContainer.methods.getServices(),
          this::overlaysContainer.methods.getServices(),
          this::featuresContainer.methods.getServices(),
          {
            get mapVm () { return vm },
            get viewVm () { return vm.$viewVm },
            get viewContainer () { return vm },
          },
        )
      },
      /**
       * @return {string|number}
       * @protected
       */
      getIdInternal () {
        return getMapId(this.$map)
      },
      /**
       * @param {string|number} id
       * @protected
       */
      setIdInternal (id) {
        if (id === this.getIdInternal()) return

        setMapId(this.$map, id)
      },
      /**
       * @return {Promise<module:ol/Map~Map>}
       */
      resolveMap: olCmp.methods.resolveOlObject,
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
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>} Coordinates in the map view projection.
       */
      async getCoordinateFromPixel (pixel, viewProj = false) {
        const coordinate = (await this.resolveMap()).getCoordinateFromPixel(pixel)
        if (viewProj) {
          return roundPointCoords(coordinate)
        }

        return this.pointToDataProj(coordinate)
      },
      /**
       * @param {Event} event
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>}
       */
      async getEventCoordinate (event, viewProj = false) {
        const coordinate = (await this.resolveMap()).getEventCoordinate(event)
        if (viewProj) {
          return roundPointCoords(coordinate)
        }

        return this.pointToDataProj(coordinate)
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
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>}
       */
      async getPixelFromCoordinate (coordinate, viewProj = false) {
        if (!viewProj) {
          coordinate = this.pointToViewProj(coordinate)
        }

        return (await this.resolveMap()).getPixelFromCoordinate(coordinate)
      },
      /**
       * @return {number[]|undefined}
       */
      getSize () {
        return coalesce(this.$map?.getSize(), this.size)
      },
      /**
       * @param {number[]} size
       */
      setSize (size) {
        assert(isArray(size) && size.length === 2, 'Invalid size')
        size = size.slice()

        if (!isEqual(size, this.size)) {
          this.size = size
        }
        if (this.$map && !isEqual(size, this.$map.getSize())) {
          this.$map.setSize(size)
        }
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
       * @return {HTMLElement|undefined}
       */
      getTarget () {
        return coalesce(this.$map?.getTarget(), this.$el)
      },
      /**
       * @param {HTMLElement} target
       */
      setTarget (target) {
        if (this.$map && target !== this.$map.getTarget()) {
          this.$map.setTarget(target)
          this.$emit('update:target', target)
        }
      },
      /**
       * @return {HTMLElement|undefined}
       */
      getViewport () {
        return this.$map?.getViewport()
      },
      /**
       * @return {module:ol/View~View|undefined}
       */
      getView () {
        return coalesce(this.$map?.getView(), this._view)
      },
      /**
       * @return {Object}
       */
      getViewVm () {
        return this._viewVm
      },
      /**
       * @param {module:ol/View~View|Vue|undefined} view
       */
      setView (view) {
        view = view?.$view || view
        assert(!view || view instanceof View, 'Invalid view')

        if (view !== this._view) {
          this._view = view
          this._viewVm = view?.vm && view?.vm[0]
        }
        if (this.$map && view !== this.$map.getView()) {
          this.$map.setView(view)
        }

        this.scheduleRefresh()
      },
      /**
       * @return {module:ol/proj~ProjectionLike|undefined}
       */
      getDataProjection () {
        return coalesce(this.$map && getMapDataProjection(this.$map), this.resolvedDataProjection)
      },
      /**
       * @param {module:ol/proj~ProjectionLike} projection
       */
      setDataProjection (projection) {
        projection = getProj(projection)
        assert(projection != null, 'Invalid projection')

        if (projection.getCode() !== this.currentDataProjection) {
          this.currentDataProjection = projection.getCode()
        }
        if (this.$map && projection.getCode() !== getMapDataProjection(this.$map)) {
          setMapDataProjection(this.$map, projection.getCode())
        }
      },
      /**
       * Triggers focus on map container.
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
      isInteracting () {
        if (!this.$map) return false

        return this.getInteractions().some(interaction => !!interaction.get('interacting'))
      },
      /**
       * @param {Object} sourceVm
       * @protected
       */
      featuresOverlaySourceCreated (sourceVm) {
        sourceVm.addFeatures(this.getFeatures())

        const adds = obsFromVueEvent(this, 'addfeature').pipe(
          mapObs(({ feature }) => feature),
          bufferDebounceTime(FRAME_TIME),
        )
        this.subscribeTo(adds, features => sourceVm.addFeatures(features))

        const removes = obsFromVueEvent(this, 'removefeature').pipe(
          mapObs(({ feature }) => feature),
          bufferDebounceTime(FRAME_TIME),
        )
        this.subscribeTo(removes, features => sourceVm.removeFeatures(features))
      },
      /**
       * @protected {string} value
       * @protected
       */
      resolvedDataProjectionChanged (value) {
        if (value === this.dataProjection) return

        this.$emit('update:dataProjection', value)
      },
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
        get: this.getView,
      },
      /**
       * @type {Object|undefined}
       */
      $viewVm: {
        enumerable: true,
        get: this.getViewVm,
      },
      $featuresOverlayVm: {
        enumerable: true,
        get: () => this.$refs?.featuresOverlay,
      },
      $featuresOverlaySourceVm: {
        enumerable: true,
        get: () => this.$refs?.featuresOverlaySource,
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
    const setterKey = addPrefix('set')
    const viewChanges = obsFromOlChangeEvent(this.$map, 'view', true).pipe(
      tap(({ value: view }) => {
        if (this._viewSubs) {
          this.unsubscribe(this._viewSubs)
        }
        if (view) {
          this._viewSubs = this.subscribeTo(
            obsFromOlChangeEvent(view, 'id', true),
            ::this.scheduleRefresh,
          )
        }
        this.viewProjection = view?.getProjection().getCode() || EPSG_3857
        this.withCustomView = view && (!view.vm || view.vm.some(vm => vm !== this.$refs.view))
      }),
    )
    const propChanges = mergeObs(
      viewChanges,
      obsFromOlChangeEvent(this.$map, [
        'dataProjection',
        'size',
        'target',
        // 'layerGroup', FIXME not ready
      ], true),
    ).pipe(
      mapObs(evt => ({
        ...evt,
        setter: this[setterKey(evt.prop)],
      })),
    )
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))

    // pointer
    const pointerEvents = mergeObs(
      obsFromOlEvent(this.$map, [
        MapBrowserEventType.CLICK,
        MapBrowserEventType.DBLCLICK,
        MapBrowserEventType.SINGLECLICK,
      ]),
      obsFromOlEvent(this.$map, [
        MapBrowserEventType.POINTERDRAG,
        MapBrowserEventType.POINTERMOVE,
      ], null, [
        distinctUntilChanged((a, b) => isEqual({
          t: a.type,
          c: a.coordinate,
        }, {
          t: b.type,
          c: b.coordinate,
        })),
      ]),
    ).pipe(
      mapObs(evt => omit({
        ...evt,
        pixel: evt.pixel,
        coordinate: this.pointToDataProj(evt.coordinate),
      }, [
        'pixel_',
        'coordinate_',
      ])),
    )
    // other
    const otherEvents = obsFromOlEvent(this.$map, [
      MapEventType.MOVESTART,
      MapEventType.MOVEEND,
      MapEventType.POSTRENDER,
      RenderEventType.PRECOMPOSE,
      RenderEventType.POSTCOMPOSE,
      RenderEventType.RENDERCOMPLETE,
    ])
    this.subscribeTo(mergeObs(pointerEvents, otherEvents), evt => this.$emit(evt.type, evt))
  }
</script>
