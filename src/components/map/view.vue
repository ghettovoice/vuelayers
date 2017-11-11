<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :center="currentCenter" :zoom="currentZoom" :resolution="currentResolution" :rotation="currentRotation"></slot>
  </i>
</template>

<script>
  /**
   * @module map/view
   */
  import Vue from 'vue'
  import View from 'ol/view'
  import { isEqual, isPlainObject, noop, get } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import { merge as mergeObs } from 'rxjs/observable/merge'
  import { distinctUntilKeyChanged } from 'rxjs/operator/distinctUntilKeyChanged'
  import { map as mapObs } from 'rxjs/operator/map'
  import {
    MIN_ZOOM,
    MAX_ZOOM,
    EPSG_3857,
    ZOOM_FACTOR,
    projHelper,
    geoJsonHelper,
    observableFromOlChangeEvent,
    olCmp,
    assert,
  } from '../../core'

  /**
   * @vueProps
   */
  const props = /** @lends module:map/view# */{
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
      type: [Boolean, Number],
      default: true,
    },
    enableRotation: {
      type: Boolean,
      default: true,
    },
    /**
     * The extent that constrains the center defined in in **EPSG:4326** projection,
     * in other words, center cannot be set outside this extent.
     * @default undefined
     */
    extent: {
      type: Array,
      validator: value => value.length === 4,
    },
    maxResolution: Number,
    minResolution: Number,
    /**
     * @default 28
     */
    maxZoom: {
      type: Number,
      default: MAX_ZOOM,
    },
    /**
     * @default 0
     */
    minZoom: {
      type: Number,
      default: MIN_ZOOM,
    },
    /**
     * @default EPSG:4326
     */
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
     * @default 0
     * @vueSync
     */
    zoom: {
      type: Number,
      default: MIN_ZOOM,
    },
    /**
     * @default 2
     */
    zoomFactor: {
      type: Number,
      default: ZOOM_FACTOR,
    },
  }

  /**
   * @vueComputed
   */
  const computed = /** @lends module:map/view# */{
    currentCenter () {
      if (this.rev && this.$view) {
        return this::getCenter()
      }

      return this.center
    },
    currentZoom () {
      if (this.rev && this.$view) {
        return this::getZoom()
      }

      return this.zoom
    },
    currentRotation () {
      if (this.rev && this.$view) {
        return this.$view.getRotation()
      }

      return this.rotation
    },
    currentResolution () {
      if (this.rev && this.$view) {
        return this.$view.getResolution()
      }

      return this.resolution
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:map/view# */{
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...(olx.AnimationOptions|function(boolean))} args
     * @return {Promise} Resolves when animation completes
     */
    animate (...args) {
      assert.hasView(this)

      let cb = args.reverse().find(x => typeof x === 'function') || noop
      args.forEach(opts => {
        let center = get('center', opts)
        if (Array.isArray(center) && center.length) {
          opts.center = projHelper.fromLonLat(center, this.projection)
        }
      })

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
        extent: this.extent
          ? projHelper.extentFromLonLat(this.extent, this.projection)
          : undefined,
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
      } else if (Array.isArray(geometryOrExtent)) {
        geometryOrExtent = projHelper.extentFromLonLat(geometryOrExtent, this.$view.getProjection())
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
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   *
   * @title View `vl-view` component
   * @alias module:map/view
   * @vueProto
   *
   * @vueSlot default [scoped] Default scoped slot with current state: center, zoom, rotation & etc.
   */
  export default {
    name: 'vl-view',
    mixins: [olCmp],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      },
    },
    /**
     * @this module:map/view
     */
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

    const ft = 0
    const resolution = observableFromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution::mapObs(() => ({
      prop: 'zoom',
      value: this::getZoom(),
    }))::distinctUntilKeyChanged('value')

    const changes = Observable::mergeObs(
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
