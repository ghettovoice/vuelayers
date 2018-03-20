<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :center="bindProjCenter" :zoom="viewZoom" :resolution="viewResolution" :rotation="viewRotation" />
  </i>
</template>

<script>
  /**
   * @module map/view
   */
  import View from 'ol/view'
  import { Observable } from 'rxjs'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operator'
  import Vue from 'vue'
  import olCmp from '../../mixin/ol-cmp'
  import projTransforms from '../../mixin/proj-transforms'
  import { EPSG_3857, MAX_ZOOM, MIN_ZOOM, ZOOM_FACTOR } from '../../ol-ext/consts'
  import observableFromOlChangeEvent from '../../rx-ext/from-ol-change-event'
  import { hasView } from '../../util/assert'
  import { isEqual, isFunction, isPlainObject, noop } from '../../util/minilo'

  /**
   * @vueProps
   */
  const props = /** @lends module:map/view# */{
    /**
     * The center coordinate in the view projection.
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
     * The extent that constrains the center defined in the view projection,
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
     * @default EPSG:3857
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
    viewZoom () {
      if (this.rev && this.$view) {
        return Math.round(this.$view.getZoom())
      }

      return this.zoom
    },
    viewRotation () {
      if (this.rev && this.$view) {
        return this.$view.getRotation()
      }

      return this.rotation
    },
    viewResolution () {
      if (this.rev && this.$view) {
        return this.$view.getResolution()
      }

      return this.resolution
    },
    viewProjCenter () {
      if (this.rev && this.$view) {
        return this.$view.getCenter()
      }
    },
    bindProjCenter () {
      if (this.viewProjCenter) {
        return this.pointToBindProj(this.viewProjCenter)
      }
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
      hasView(this)

      let cb = noop
      if (isFunction(args[args.length - 1])) {
        cb = args[args.length - 1]
        args = args.slice(0, args.length - 1)
      }
      args.forEach(opts => {
        if (!Array.isArray(opts.center)) return
        opts.center = this.pointToViewProj(opts.center)
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
        center: this.pointToViewProj(this.center),
        constrainRotation: this.constrainRotation,
        enableRotation: this.enableRotation,
        extent: this.extent ? this.extentToViewProj(this.extent) : undefined,
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
      hasView(this)

      // transform from GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = this.readGeometryInBindProj(geometryOrExtent)
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
      if (this.$view && !isEqual(value, this.bindProjCenter)) {
        this.$view.setCenter(this.pointToViewProj(value))
      }
    },
    resolution (value) {
      if (this.$view && value !== this.viewResolution) {
        this.$view.setResolution(value)
      }
    },
    zoom (value) {
      value = Math.round(value)
      if (this.$view && value !== this.viewZoom) {
        this.$view.setZoom(value)
      }
    },
    rotation (value) {
      if (this.$view && value !== this.viewRotation) {
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
    mixins: [olCmp, projTransforms],
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
   * @private
   */
  function subscribeToViewChanges () {
    hasView(this)

    const ft = 0
    const resolution = observableFromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution::mapObs(() => ({
      prop: 'zoom',
      value: Math.round(this.$view.getZoom()),
    }))::distinctUntilKeyChanged('value')

    const changes = Observable::mergeObs(
      observableFromOlChangeEvent(this.$view, 'center', true, ft, () => this.pointToBindProj(this.$view.getCenter())),
      observableFromOlChangeEvent(this.$view, 'rotation', true, ft),
      resolution,
      zoom
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
