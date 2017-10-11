<script>
  /**
   * @module map/view
   */
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual, isPlainObject, noop } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/debounceTime'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import {
    MIN_ZOOM,
    MAX_ZOOM,
    EPSG_3857,
    ZOOM_FACTOR,
    projHelper,
    geoJsonHelper,
    observableFromOlChangeEvent,
    olVirtCmp,
    assert,
  } from '../../core'

  /**
   * @vueProps
   */
  const props = {
    /**
     * The center coordinate of the map view in **EPSG:4326** projection.
     * @type {number[]}
     * @default [0, 0]
     * @vueSync
     */
    center: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2,
    },
    constrainRotation: {
      type: Boolean,
      default: true,
    },
    enableRotation: {
      type: Boolean,
      default: true,
    },
    extent: {
      type: Array,
      validator: value => value.length === 4,
    },
    maxResolution: Number,
    minResolution: Number,
    maxZoom: {
      type: Number,
      default: MAX_ZOOM,
    },
    minZoom: {
      type: Number,
      default: MIN_ZOOM,
    },
    projection: {
      type: String,
      default: EPSG_3857,
    },
    resolution: Number,
    resolutions: Array,
    /**
     * The initial rotation for the view in **radians** (positive rotation clockwise).
     * @type {number}
     * @vueSync
     */
    rotation: {
      type: Number,
      default: 0,
    },
    /**
     * Zoom level used to calculate the resolution for the view as `int` value. Only used if `resolution` is not defined.
     * @type {number}
     * @vueSync
     */
    zoom: {
      type: Number,
      default: MIN_ZOOM,
    },
    zoomFactor: {
      type: Number,
      default: ZOOM_FACTOR,
    },
  }

  const computed = {
  }

  /**
   * @vueMethods
   */
  const methods = {
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...(olx.AnimationOptions|function(boolean))} args
     * @return {Promise} Resolves when animation completes
     */
    animate (...args) {
      assert.hasView(this)

      let cb = args.reverse().find(x => typeof x === 'function') || noop

      return new Promise(
        resolve => this.$view.animate(...args, complete => {
          cb(complete)
          resolve(complete)
        })
      )
    },
    /**
     * @return {ol.View}
     * @protected
     */
    createOlObject () {
      return new View({
        center: projHelper.fromLonLat(this.center, this.projection),
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
        zoomFactor: this.zoomFactor,
      })
    },
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#fit}
     * @param {GeoJSONFeature|ol.Extent|ol.geom.Geometry|Vue} geometryOrExtent
     * @param {olx.view.FitOptions} [options]
     * @return {Promise} Resolves when view changes
     */
    fit (geometryOrExtent, options = {}) {
      assert.hasView(this)

      // transform to GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = geoJsonHelper.readGeometry(geometryOrExtent, this.$view.getProjection())
      } else if (geometryOrExtent instanceof Vue) {
        geometryOrExtent = geometryOrExtent.$geometry
      }

      let cb = options.callback || noop

      return new Promise(resolve => {
        this.$view.fit(geometryOrExtent, {
          ...options,
          callback: complete => {
            cb(complete)
            resolve(complete)
          },
        })
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      this.$viewContainer && this.$viewContainer.setView(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      this.unsubscribeAll()
      this.$viewContainer && this.$viewContainer.setView(undefined)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToViewChanges()
    },
  }

  const watch = {
    center (value) {
      if (this.$view && !isEqual(value, this::getCenter())) {
        this.$view.setCenter(projHelper.fromLonLat(value, this.$view.getProjection()))
      }
    },
    resolution (value) {
      if (this.$view && value !== this.$view.getResolution()) {
        this.$view.setResolution(value)
      }
    },
    zoom (value) {
      value = Math.round(value)
      if (this.$view && value !== this::getZoom()) {
        this.$view.setZoom(value)
      }
    },
    rotation (value) {
      if (this.$view && value !== this.$view.getRotation()) {
        this.$view.setRotation(value)
      }
    },
    minZoom (value) {
      if (this.$view && value !== this.$view.getMinZoom()) {
        this.$view.setMinZoom(value)
      }
    },
    maxZoom (value) {
      if (this.$view && value !== this.$view.getMaxZoom()) {
        this.$view.setMaxZoom(value)
      }
    },
  }

  /**
   *  Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   *
   * @title View `vl-view` component
   * @vueProto
   */
  export default {
    name: 'vl-view',
    mixins: [olVirtCmp],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      },
    },
    data () {
      return {
        rev: 1,
      }
    },
    created () {
      Object.defineProperties(this, /** @lends module:map/view# */{
        /**
         * @type {ol.View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $viewContainer: {
          enumerable: true,
          get: () => this.$services && this.$services.viewContainer,
        },
      })
    },
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @this module:map/view
   * @private
   */
  function subscribeToViewChanges () {
    assert.hasView(this)

    const ft = 100
    const resolution = observableFromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution.map(() => ({
      prop: 'zoom',
      value: this::getZoom(),
    })).debounceTime(2 * ft)
      .distinctUntilChanged(isEqual)

    const changes = Observable.merge(
      observableFromOlChangeEvent(this.$view, 'center', true, ft, this::getCenter),
      observableFromOlChangeEvent(this.$view, 'rotation', true, ft),
      resolution,
      zoom
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }

  function getZoom () {
    return Math.round(this.$view.getZoom())
  }

  function getCenter () {
    return projHelper.toLonLat(this.$view.getCenter(), this.$view.getProjection())
  }
</script>
