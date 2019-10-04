<template>
  <i :id="vmId" :class="cmpName" style="display: none !important;">
    <slot :center="currentCenter" :zoom="currentZoom" :resolution="currentResolution" :rotation="currentRotation"/>
  </i>
</template>

<script>
  import View from 'ol/View'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operators'
  import Vue from 'vue'
  import { olCmp, projTransforms } from '../../mixin'
  import { EPSG_3857, getViewId, initializeView, MAX_ZOOM, MIN_ZOOM, setViewId, ZOOM_FACTOR } from '../../ol-ext'
  import { observableFromOlChangeEvent } from '../../rx-ext'
  import { arrayLengthValidator, coalesce, isEqual, isFunction, isPlainObject, noop } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   */
  export default {
    name: 'vl-view',
    mixins: [olCmp, projTransforms],
    props: {
      /**
       * The center coordinate in the view projection.
       * @type {number[]}
       * @default [0, 0]
       */
      center: {
        type: Array,
        default: () => [0, 0],
        validator: arrayLengthValidator(2),
      },
      constrainOnlyCenter: {
        type: Boolean,
        default: false,
      },
      /**
       * The extent that constrains the center defined in the view projection,
       * in other words, center cannot be set outside this extent.
       * @default undefined
       */
      extent: {
        type: Array,
        validator: arrayLengthValidator(4),
      },
      smoothExtentConstraint: {
        type: Boolean,
        default: true,
      },
      /**
       * The initial rotation for the view in **radians** (positive rotation clockwise).
       * @type {number}
       */
      rotation: {
        type: Number,
        default: 0,
      },
      enableRotation: {
        type: Boolean,
        default: true,
      },
      constrainRotation: {
        type: [Boolean, Number],
        default: true,
      },
      resolution: Number,
      resolutions: Array,
      maxResolution: Number,
      minResolution: Number,
      constrainResolution: {
        type: Boolean,
        default: false,
      },
      smoothResolutionConstraint: {
        type: Boolean,
        default: true,
      },
      /**
       * Zoom level used to calculate the resolution for the view as `int` value. Only used if `resolution` is not defined.
       * @type {number}
       * @default 0
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
      multiWorld: {
        type: Boolean,
        default: false,
      },
      /**
       * @type {string}
       * @default EPSG:3857
       */
      projection: {
        type: String,
        default: EPSG_3857,
      },
    },
    computed: {
      currentZoom () {
        if (this.rev && this.$view) {
          return this.$view.getZoom()
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
      currentCenter () {
        if (this.rev && this.$view) {
          return this.pointToDataProj(this.$view.getCenter())
        }
      },
      currentCenterViewProj () {
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
    },
    methods: {
      /**
       * @return {module:ol/View~View}
       * @protected
       */
      createOlObject () {
        const view = new View({
          center: this.pointToViewProj(this.center),
          constrainOnlyCenter: this.constrainOnlyCenter,
          extent: this.extent ? this.extentToViewProj(this.extent) : undefined,
          smoothExtentConstraint: this.smoothExtentConstraint,
          rotation: this.rotation,
          enableRotation: this.enableRotation,
          constrainRotation: this.constrainRotation,
          resolution: this.resolution,
          resolutions: this.resolutions,
          maxResolution: this.maxResolution,
          minResolution: this.minResolution,
          constrainResolution: this.constrainResolution,
          smoothResolutionConstraint: this.smoothResolutionConstraint,
          zoom: this.zoom,
          zoomFactor: this.zoomFactor,
          maxZoom: this.maxZoom,
          minZoom: this.minZoom,
          multiWorld: this.multiWorld,
          projection: this.projection,
        })

        initializeView(view, this.id)

        return view
      },
      /**
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#animate}
       * @param {...(AnimationOptions|function(boolean))} args
       * @return {Promise} Resolves when animation completes
       */
      async animate (...args) {
        let cb = noop
        if (isFunction(args[args.length - 1])) {
          cb = args[args.length - 1]
          args = args.slice(0, args.length - 1)
        }
        args.forEach(opts => {
          if (!Array.isArray(opts.center)) return
          opts.center = this.pointToViewProj(opts.center)
        })

        await this.$createPromise

        return new Promise(resolve => {
          return this.$view.animate(...args, complete => {
            cb(complete)
            resolve(complete)
          })
        })
      },
      async getAnimating () {
        await this.$createPromise

        return this.$view.getAnimating()
      },
      async cancelAnimations () {
        await this.$createPromise

        return this.$view.cancelAnimations()
      },
      /**
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit}
       * @param {Object|module:ol/geom/SimpleGeometry~SimpleGeometry|module:ol/extent~Extent|Vue} geometryOrExtent
       * @param {FitOptions} [options]
       * @return {Promise} Resolves when view changes
       */
      async fit (geometryOrExtent, options = {}) {
        // transform from GeoJSON, vl-feature to ol.Feature
        if (isPlainObject(geometryOrExtent)) {
          geometryOrExtent = this.readGeometryInDataProj(geometryOrExtent)
        } else if (geometryOrExtent instanceof Vue) {
          geometryOrExtent = geometryOrExtent.$geometry
        }

        let cb = options.callback || noop

        await this.$createPromise

        return new Promise(resolve => {
          return this.$view.fit(geometryOrExtent, {
            ...options,
            callback: complete => {
              cb(complete)
              resolve(complete)
            },
          })
        })
      },
      async beginInteraction () {
        await this.$createPromise

        this.$view.beginInteraction()
      },
      async endInteraction (duration, resolutionDirection, anchor) {
        await this.$createPromise

        this.$view.endInteraction(duration, resolutionDirection, anchor)
      },
      async getInteracting () {
        await this.$createPromise

        return this.getInteracting()
      },
      async calculateExtent () {
        await this.$createPromise

        return this.$view.calculateExtent()
      },
      async centerOn (coordinate, size, position) {
        await this.$createPromise

        this.$view.centerOn(coordinate, size, position)
      },
      async getCenter () {
        await this.$createPromise

        return this.$view.getCenter()
      },
      async setCenter (center) {
        await this.$createPromise

        if (isEqual(center, this.$view.getCenter())) return

        return this.$view.setCenter(center)
      },
      async getResolution () {
        await this.$createPromise

        return this.$view.getResolution()
      },
      async setResolution (resolution) {
        await this.$createPromise

        if (resolution === this.$view.getResolution()) return

        this.$view.setResolution(resolution)
      },
      async getResolutionForExtent (extent, size) {
        await this.$createPromise

        return this.$view.getResolutionForExtent(extent, size)
      },
      async getResolutionForZoom (zoom) {
        await this.$createPromise

        return this.$view.getResolutionForZoom(zoom)
      },
      async getResolutions () {
        await this.$createPromise

        return this.$view.getResolutions()
      },
      async getMaxResolution () {
        await this.$createPromise

        return this.$view.getMaxResolution()
      },
      async getMinResolution () {
        await this.$createPromise

        return this.$view.getMinResolution()
      },
      async getZoom () {
        await this.$createPromise

        return this.$view.getZoom()
      },
      async setZoom (zoom) {
        await this.$createPromise

        if (zoom === this.$view.getZoom()) return

        this.$view.setZoom(zoom)
      },
      async getZoomForResolution (resolution) {
        await this.$createPromise

        return this.$view.getZoomForResolution(resolution)
      },
      async getMaxZoom () {
        await this.$createPromise

        return this.$view.getMaxZoom()
      },
      async setMaxZoom (zoom) {
        await this.$createPromise

        if (zoom === this.$view.getMaxZoom()) return

        this.$view.setMaxZoom(zoom)
      },
      async getMinZoom () {
        await this.$createPromise

        return this.$view.getMinZoom()
      },
      async setMinZoom (zoom) {
        await this.$createPromise

        if (zoom === this.$view.getMinZoom()) return

        return this.$view.setMinZoom(zoom)
      },
      async getProjection () {
        await this.$createPromise

        return this.$view.getProjection()
      },
      async getRotation () {
        await this.$createPromise

        return this.$view.getRotation()
      },
      async setRotation (rotation) {
        await this.$createPromise

        if (rotation === this.$view.getRotation()) return

        this.$view.setRotation(rotation)
      },
      async getId () {
        await this.$createPromise

        return getViewId(this.$view)
      },
      async setId (id) {
        await this.$createPromise

        if (id === getViewId(this.$view)) return

        setViewId(this.$view, id)
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        await this.$createPromise

        this.$viewContainer && this.$viewContainer.setView(this)

        return this.subscribeAll()
      },
      /**
       * @return {void}
       * @protected
       */
      async unmount () {
        await this.unsubscribeAll()

        this.$viewContainer && this.$viewContainer.setView(undefined)
      },
      /**
       * @return {void|Promise<void>}
       * @protected
       */
      subscribeAll () {
        return this::subscribeToEvents()
      },
    },
    watch: {
      id (value) {
        this.setId(value)
      },
      async center (value) {
        if (await this.getAnimating()) return

        this.setCenter(this.pointToViewProj(value))
      },
      async rotation (value) {
        if (await this.getAnimating()) return

        this.setRotation(value)
      },
      async resolution (value) {
        if (await this.getAnimating()) return

        this.setResolution(value)
      },
      async zoom (value) {
        if (await this.getAnimating()) return

        this.setZoom(value)
      },
      minZoom (value) {
        this.setMinZoom(value)
      },
      maxZoom (value) {
        this.setMaxZoom(value)
      },
      ...makeWatchers([
        'constrainOnlyCenter',
        'extent',
        'smoothExtentConstraint',
        'enableRotation',
        'constrainRotation',
        'resolutions',
        'maxResolution',
        'minResolution',
        'constrainResolution',
        'smoothResolutionConstraint',
        'zoomFactor',
        'multiWorld',
        'resolvedDataProjection',
        'projection',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
    stubVNode: {
      empty () {
        return this.vmId
      },
    },
    created () {
      this::defineServices()
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * @type {module:ol/View~View|undefined}
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
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @private
   */
  async function subscribeToEvents () {
    await this.$createPromise

    const ft = 1000 / 60
    const resolution = observableFromOlChangeEvent(this.$view, 'resolution', true, ft)
    const zoom = resolution.pipe(
      mapObs(() => ({
        prop: 'zoom',
        value: this.$view.getZoom(),
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

      this.$nextTick(() => {
        this.$emit(`update:${prop}`, value)
      })
    })
  }
</script>
