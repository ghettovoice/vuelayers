<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :center="viewCenter" :zoom="viewZoom" :resolution="viewResolution" :rotation="viewRotation"/>
  </i>
</template>

<script>
  import View from 'ol/View'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operators'
  import Vue from 'vue'
  import { olCmp, projTransforms } from '../../mixin'
  import { EPSG_3857, MAX_ZOOM, MIN_ZOOM, ZOOM_FACTOR } from '../../ol-ext'
  import { observableFromOlChangeEvent } from '../../rx-ext'
  import { hasView } from '../../util/assert'
  import { coalesce, isEqual, isFunction, isPlainObject, noop } from '../../util/minilo'

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
     * @type {string}
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
    viewCenter () {
      if (this.rev && this.$view) {
        return this.pointToDataProj(this.$view.getCenter())
      }
    },
    viewCenterViewProj () {
      if (this.rev && this.$view) {
        return this.$view.getCenter()
      }
    },
    /**
     * @return {ProjectionLike}
     */
    resolvedDataProjection () {
      // exclude this.projection from lookup to allow view rendering in projection
      // that differs from data projection
      return coalesce(
        this.$viewContainer && this.$viewContainer.resolvedDataProjection,
        this.$options.dataProjection,
        this.viewProjection,
      )
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:map/view# */{
    /**
     * @see {@link https://openlayers.org/en/latest/apidoc/ol.View.html#animate}
     * @param {...(AnimationOptions|function(boolean))} args
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
        }),
      )
    },
    /**
     * @return {View}
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
     * @param {Object|Extent|Geometry|Vue} geometryOrExtent
     * @param {FitOptions} [options]
     * @return {Promise} Resolves when view changes
     */
    fit (geometryOrExtent, options = {}) {
      hasView(this)

      // transform from GeoJSON, vl-feature to ol.Feature
      if (isPlainObject(geometryOrExtent)) {
        geometryOrExtent = this.readGeometryInDataProj(geometryOrExtent)
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
      value = this.pointToViewProj(value)
      if (this.$view && !this.$view.getAnimating() && !isEqual(value, this.viewCenterViewProj)) {
        this.$view.setCenter(value)
      }
    },
    resolution (value) {
      if (this.$view && !this.$view.getAnimating() && value !== this.viewResolution) {
        this.$view.setResolution(value)
      }
    },
    zoom (value) {
      value = Math.round(value)
      if (this.$view && !this.$view.getAnimating() && value !== this.viewZoom) {
        this.$view.setZoom(value)
      }
    },
    rotation (value) {
      if (this.$view && !this.$view.getAnimating() && value !== this.viewRotation) {
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
    resolvedDataProjection () {
      if (this.$view) {
        this.$view.setCenter(this.pointToViewProj(this.center))
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
         * @type {View|undefined}
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

    const ft = 1000 / 60
    const resolution = observableFromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution.pipe(
      mapObs(() => ({
        prop: 'zoom',
        value: Math.round(this.$view.getZoom()),
      })),
      distinctUntilKeyChanged('value'),
    )

    const changes = mergeObs(
      observableFromOlChangeEvent(this.$view, 'center', true, ft, () => this.pointToDataProj(this.$view.getCenter())),
      observableFromOlChangeEvent(this.$view, 'rotation', true, ft),
      resolution,
      zoom,
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
