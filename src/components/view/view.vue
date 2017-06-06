<script>
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual, isPlainObject } from 'lodash/fp'
  import { VM_PROP } from '../../consts'
  import Observable from '../../rx-ext'
  import { MIN_ZOOM, MAX_ZOOM, MAP_PROJ, ZOOM_FACTOR, proj, geoJson } from '../../ol-ext'
  import services from '../services'
  import rxSubs from '../rx-subs'
  import stubVNode from '../stub-vnode'
  import { assertHasView } from '../../utils/assert'

  const props = {
    center: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2
    },
    constrainRotation: Boolean,
    enableRotation: Boolean,
    extent: {
      type: Array,
      validator: value => value.length === 4
    },
    maxResolution: Number,
    minResolution: Number,
    maxZoom: {
      type: Number,
      default: MAX_ZOOM
    },
    minZoom: {
      type: Number,
      default: MIN_ZOOM
    },
    projection: {
      type: String,
      default: MAP_PROJ
    },
    resolution: Number,
    resolutions: Array,
    rotation: {
      type: Number,
      default: 0
    },
    zoom: {
      type: Number,
      default: MIN_ZOOM
    },
    zoomFactor: {
      type: Number,
      default: ZOOM_FACTOR
    }
  }

  const methods = {
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...(olx.AnimationOptions|function(boolean))} args
     * @return {Promise} Resolves when animation completes
     */
    animate (...args) {
      assertHasView(this)

      let cb = args.reverse().find(x => typeof x === 'function')

      return new Promise(
        resolve => this.view.animate(...args, complete => {
          cb && cb(complete)
          resolve(complete)
        })
      )
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     * @param {GeoJSONFeature|ol.Extent|ol.Geometry|Vue} geometryOrExtent
     * @param {olx.view.FitOptions} [options]
     * @return {Promise} Resolves when view changes
     */
    fit (geometryOrExtent, options) {
      assertHasView(this)

      // transform to GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = geoJson.readGeometry(geometryOrExtent, this.view.getProjection())
      } else if (geometryOrExtent instanceof Vue) {
        geometryOrExtent = geometryOrExtent.geom
      }

      let duration = (options && options.duration) || 0

      return new Promise(resolve => {
        this.view.fit(geometryOrExtent, options)
        setTimeout(resolve, duration)
      })
    },
    /**
     * @return {ol.View|undefined} OpenLayers `ol.View` instance
     */
    getView () {
      return this._view
    },
    /**
     * @return {void}
     */
    refresh () {
      assertHasView(this)
      this.view.changed()
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToViewChanges()
    },
    /**
     * @param {olx.ViewOptions} viewOptions
     * @return {void}
     * @protected
     */
    updateView (viewOptions) {
      assertHasView(this)
      // center
      if (viewOptions.center != null && !isEqual(viewOptions.center, this.currentCenter)) {
        this.view.setCenter(proj.fromLonLat(viewOptions.center, this.projection))
      }
      // resolution & zoom
      if (viewOptions.resolution != null && viewOptions.resolution !== this.currentResolution) {
        this.view.setResolution(viewOptions.resolution)
      } else if (viewOptions.zoom != null && viewOptions.zoom !== this.currentZoom) {
        this.view.setZoom(viewOptions.zoom)
      }
      // rotation
      if (viewOptions.rotation != null && viewOptions.rotation !== this.currentRotation) {
        this.view.setRotation(viewOptions.rotation)
      }
      // minZoom
      if (viewOptions.minZoom != null && viewOptions.minZoom !== this.view.getMinZoom()) {
        this.view.setMinZoom(viewOptions.minZoom)
      }
      // maxZoom
      if (viewOptions.maxZoom != null && viewOptions.maxZoom !== this.view.getMaxZoom()) {
        this.view.setMaxZoom(viewOptions.maxZoom)
      }
    }
  }

  const watch = {
    center (center) {
      this.updateView({ center })
    },
    resolution (resolution) {
      this.updateView({ resolution })
    },
    zoom (zoom) {
      this.updateView({ zoom })
    },
    rotation (rotation) {
      this.updateView({ rotation })
    },
    minZoom (minZoom) {
      this.updateView({ minZoom })
    },
    maxZoom (maxZoom) {
      this.updateView({ maxZoom })
    }
  }

  export default {
    name: 'vl-view',
    mixins: [rxSubs, stubVNode, services],
    props,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      }
    },
    data () {
      return {
        currentCenter: this.center.splice(),
        currentZoom: Math.ceil(this.zoom),
        currentResolution: this.resolution,
        currentRotation: this.rotation
      }
    },
    created () {
      this::initialize()
    },
    mounted () {
      this::mount()
    },
    destroyed () {
      this::unmount()
      this._view = undefined
    }
  }

  /**
   * @return {void}
   * @private
   */
  function initialize () {
    /**
     * @type {ol.View}
     * @protected
     */
    this._view = new View({
      center: proj.fromLonLat(this.center, this.projection),
      constrainRotation: this.constrainRotation,
      enableRotation: this.enableRotation,
      extent: this.extent,
      maxResolution: this.maxResolution,
      minResolution: this.minResolution,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      projection: this.projection,
      resolution: this.resolution,
      resolutions: this.resolutions,
      rotation: this.rotation,
      zoom: this.zoom,
      zoomFactor: this.zoomFactor
    })
    this._view.set(VM_PROP, this)
    this::defineAccessors()
  }

  /**
   * @return {void}
   * @private
   */
  function defineAccessors () {
    // define getters
    Object.defineProperties(this, {
      view: {
        enumerable: true,
        get: this.getView
      }
    })
  }

  /**
   * @return {void}
   * @private
   */
  function mount () {
    this.$parent.setView(this)
    this.subscribeAll()
  }

  /**
   * @return {void}
   * @private
   */
  function unmount () {
    this.unsubscribeAll()
    this.$parent.setView(undefined)
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @private
   */
  function subscribeToViewChanges () {
    assertHasView(this)

    const centerChanges = Observable.of(this.view.getCenter())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:center',
          () => this.view.getCenter()
        )
      )
    const resolutionChanges = Observable.of(this.view.getResolution())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:resolution',
          () => this.view.getResolution()
        )
      )
    const rotationChanges = Observable.of(this.view.getRotation())
      .merge(
        Observable.fromOlEvent(
          this.view,
          'change:rotation',
          () => this.view.getRotation()
        )
      )
    const viewChanges = Observable.combineLatest(
      centerChanges,
      resolutionChanges,
      rotationChanges
    ).throttleTime(1000 / 30)
      .distinctUntilChanged((a, b) => isEqual(a, b))
      .map(([center, resolution, rotation]) => ({
        center: proj.toLonLat(center, this.view.getProjection()),
        resolution: resolution,
        rotation
      }))

    this.subscribeTo(viewChanges, ({ center, resolution, rotation }) => {
      if (!isEqual(this.currentCenter, center)) {
        this.currentCenter = center
      }

      if (this.currentResolution !== resolution) {
        this.currentResolution = resolution
        this.currentZoom = Math.ceil(this.view.getZoom())
      }

      if (this.currentRotation !== rotation) {
        this.currentRotation = rotation
      }

      this.$emit('change', {
        center: this.currentCenter,
        resolution: this.currentResolution,
        rotation: this.currentRotation,
        zoom: this.currentZoom
      })
    })
  }
</script>
