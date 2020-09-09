<template>
  <div
    :id="vmId"
    :class="vmClass"
    :tabindex="tabindex">
    <slot>
      <ViewCmp :id="'vl-' + id + '-default-view'" />
    </slot>
    <VectorLayerCmp
      :id="'vl-' + id + '-default-layer'"
      ref="featuresOverlay"
      :overlay="true"
      :update-while-animating="updateWhileAnimating"
      :update-while-interacting="updateWhileInteracting">
      <VectorSourceCmp
        :id="'vl-' + id + '-default-source'"
        ref="featuresOverlaySource"
        :wrap-x="wrapX"
        @created="onFeaturesOverlaySourceCreated">
        <slot name="overlay" />
      </VectorSourceCmp>
    </VectorLayerCmp>
  </div>
</template>

<script>
  import { Collection, Map, View } from 'ol'
  import MapBrowserEventType from 'ol/MapBrowserEventType'
  import MapEventType from 'ol/MapEventType'
  import { get as getProj } from 'ol/proj'
  import RenderEventType from 'ol/render/EventType'
  import { merge as mergeObs } from 'rxjs'
  import { distinctUntilChanged, map as mapObs, skipWhile } from 'rxjs/operators'
  import {
    controlsContainer,
    featuresContainer,
    interactionsContainer,
    layersContainer,
    olCmp,
    OlObjectEvent,
    overlaysContainer,
    projTransforms,
  } from '../../mixins'
  import { getMapDataProjection, getMapId, roundPointCoords, setMapDataProjection, setMapId } from '../../ol-ext'
  import {
    fromOlChangeEvent as obsFromOlChangeEvent,
    fromOlEvent as obsFromOlEvent,
    fromVueEvent as obsFromVueEvent,
  } from '../../rx-ext'
  import { addPrefix, assert, hasProp, isEqual, isFunction, makeWatchers, mergeDescriptors, waitFor } from '../../utils'
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
    watch: {
      async defaultControls (value) {
        await this.initDefaultControls(value)
      },
      async defaultInteractions (value) {
        await this.initDefaultInteractions(value)
      },
      async dataProjection (value) {
        await this.setDataProjection(value)
      },
      .../*#__PURE__*/makeWatchers([
        'keyboardEventTarget',
        'moveTolerance',
        'pixelRatio',
        'maxTilesLoading',
      ], prop => async function (val, prev) {
        if (isEqual(val, prev)) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      /**
       * @type {module:ol/View~View}
       * @private
       */
      this._view = new View()
      /**
       * @type {Object|undefined}
       */
      this._viewVm = undefined
      // todo wrap controls into components and provide vl-control-default
      this.initDefaultControls(this.defaultControls)
      // todo initialize without interactions and provide vl-interaction-default component
      this.initDefaultInteractions(this.defaultInteractions)

      this::defineServices()
    },
    methods: {
      /**
       * @return {Promise<module:ol/Map~Map>}
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
        setMapDataProjection(map, this.dataProjection)

        return map
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async beforeMount () {
        try {
          await waitFor(
            () => this.$viewVm != null,
            obsFromVueEvent(this.$eventBus, [
              OlObjectEvent.CREATE_ERROR,
              OlObjectEvent.MOUNT_ERROR,
            ]).pipe(
              mapObs(([vm]) => hasProp(vm, '$view') && vm.$vq?.closest(this)),
            ),
            1000,
          )

          return this::olCmp.methods.beforeMount()
        } catch (err) {
          err.message = 'Wait for $viewVm failed: ' + err.message
          throw err
        }
      },
      /**
       * @return {Promise<void>}
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
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::olCmp.methods.subscribeAll()
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
       * @return {Promise<module:ol/Map~Map>}
       */
      resolveMap: olCmp.methods.resolveOlObject,
      /**
       * @return {number|string}
       */
      getIdInternal () {
        return getMapId(this.$map)
      },
      /**
       * @param {string|number} id
       * @return {Promise<void>}
       */
      setIdInternal (id) {
        assert(id != null && id !== '', 'Invalid map id')

        if (id === this.getIdInternal()) return

        setMapId(this.$map, id)
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
       * @return {Promise<number[]>}
       */
      async getSize () {
        return (await this.resolveMap()).getSize()
      },
      /**
       * @return {Promise<void>}
       */
      async setSize (size) {
        if (isEqual(size, await this.getSize())) return

        (await this.resolveMap()).setSize(size)
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
        (await this.resolveMap()).setTarget(target)
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
      getView () {
        return this._view
      },
      /**
       * @param {module:ol/View~View|Vue|undefined} view
       * @return {Promise<void>}
       */
      async setView (view) {
        if (view && isFunction(view.resolveOlObject)) {
          view = await view.resolveOlObject()
        }
        view || (view = new View())

        if (view === await this.getView()) return

        (await this.resolveMap()).setView(view)
        this._view = view
        this._viewVm = view.vm && view.vm[0]
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

        if (projection === await this.getDataProjection()) return

        setMapDataProjection(await this.resolveMap(), projection)
        await this.scheduleRefresh()
      },
      /**
       * @return {Promise<boolean>}
       */
      async getWrapX () {
        if (!this.$featuresOverlaySourceVm) return false

        return this.$featuresOverlaySourceVm.getWrapX()
      },
      /**
       * @return {Promise<boolean>}
       */
      async getUpdateWhileAnimating () {
        if (!this.$featuresOverlayVm) return false

        return this.$featuresOverlayVm.getUpdateWhileAnimating()
      },
      /**
       * @returns {Promise<boolean>}
       */
      async getUpdateWhileInteracting () {
        if (!this.$featuresOverlayVm) return false

        return this.$featuresOverlayVm.getUpdateWhileInteracting()
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
       * @param {Object} sourceVm
       * @protected
       */
      async onFeaturesOverlaySourceCreated (sourceVm) {
        if (!this.getFeatures().length) {
          await Promise.all(this.getFeatures().map(::sourceVm.addFeature))
        }

        const adds = obsFromVueEvent(this, 'addfeature')
        this.subscribeTo(adds, ({ feature }) => sourceVm.addFeature(feature))

        const removes = obsFromVueEvent(this, 'removefeature')
        this.subscribeTo(removes, ({ feature }) => sourceVm.removeFeature(feature))
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
        get: () => this._viewVm,
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
    const prefixKey = addPrefix('current')
    const propChanges = mergeObs(
      obsFromOlChangeEvent(this.$map, [
        'id',
      ], true, evt => ({
        ...evt,
        compareWith: this[prefixKey(evt.prop)],
      })),
    ).pipe(
      skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
    )
    this.subscribeTo(propChanges, () => {
      ++this.rev
    })

    const otherChanges = obsFromOlChangeEvent(this.$map, [
      'layerGroup',
      'size',
      'target',
      'view',
    ], true)
    this.subscribeTo(otherChanges, ({ prop, value }) => {
      ++this.rev
      this.$nextTick(() => this.$emit(`update:${prop}`, value))
    })

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
      ]).pipe(
        distinctUntilChanged((a, b) => isEqual(a.coordinate, b.coordinate)),
      ),
    ).pipe(
      mapObs(evt => ({
        ...evt,
        coordinate: this.pointToDataProj(evt.coordinate),
      })),
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
    this.subscribeTo(mergeObs(pointerEvents, otherEvents), evt => {
      this.$emit(evt.type, evt)
    })
  }
</script>
