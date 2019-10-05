<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :center="currentCenter"
      :zoom="currentZoom"
      :resolution="currentResolution"
      :rotation="currentRotation" />
  </i>
</template>

<script>
  import { View } from 'ol'
  import { merge as mergeObs } from 'rxjs/observable'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operators'
  import Vue from 'vue'
  import { olCmp, projTransforms } from '../../mixin'
  import { EPSG_3857, getViewId, initializeView, MAX_ZOOM, MIN_ZOOM, setViewId, ZOOM_FACTOR } from '../../ol-ext'
  import { obsFromOlChangeEvent } from '../../rx-ext'
  import { arrayLengthValidator, coalesce, isEqual, isFunction, isPlainObject, noop } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   */
  export default {
    name: 'VlView',
    mixins: [olCmp, projTransforms],
    stubVNode: {
      empty () {
        return this.vmId
      },
    },
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
        if (!(this.rev && this.$view)) return

        return this.pointToDataProj(this.$view.getCenter())
      },
      currentCenterViewProj () {
        if (!(this.rev && this.$view)) return

        return this.$view.getCenter()
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
    watch: {
      id (value) {
        this.setId(value)
      },
      async center (value) {
        if (await this.getAnimating()) return

        this.setCenter(value)
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
    created () {
      this::defineServices()
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

        const view = await this.resolveView()

        return new Promise(resolve => {
          view.animate(...args, complete => {
            cb(complete)
            resolve(complete)
          })
        })
      },
      async getAnimating () {
        return (await this.resolveView()).getAnimating()
      },
      async cancelAnimations () {
        return (await this.resolveView()).cancelAnimations()
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

        const cb = options.callback || noop

        const view = await this.resolveView()

        return new Promise(resolve => {
          view.fit(geometryOrExtent, {
            ...options,
            callback: complete => {
              cb(complete)
              resolve(complete)
            },
          })
        })
      },
      async beginInteraction () {
        (await this.resolveView()).beginInteraction()
      },
      async endInteraction (duration, resolutionDirection, anchor) {
        (await this.resolveView()).endInteraction(duration, resolutionDirection, anchor)
      },
      async getInteracting () {
        return (await this.resolveView()).getInteracting()
      },
      async calculateExtent () {
        return this.extentToDataProj((await this.resolveView()).calculateExtent())
      },
      async centerOn (coordinate, size, position) {
        (await this.resolveView()).centerOn(this.pointToViewProj(coordinate), size, position)
      },
      async getCenter () {
        return this.pointToDataProj((await this.resolveView()).getCenter())
      },
      async setCenter (center) {
        center = this.pointToViewProj(center)
        const view = await this.resolveView()

        if (isEqual(center, view.getCenter())) return

        return view.setCenter(center)
      },
      async getResolution () {
        return (await this.resolveView()).getResolution()
      },
      async setResolution (resolution) {
        const view = await this.resolveView()

        if (resolution === view.getResolution()) return

        view.setResolution(resolution)
      },
      async getResolutionForExtent (extent, size) {
        return (await this.resolveView()).getResolutionForExtent(this.extentToViewProj(extent), size)
      },
      async getResolutionForZoom (zoom) {
        return (await this.resolveView()).getResolutionForZoom(zoom)
      },
      async getResolutions () {
        return (await this.resolveView()).getResolutions()
      },
      async getMaxResolution () {
        return (await this.resolveView()).getMaxResolution()
      },
      async getMinResolution () {
        return (await this.resolveView()).getMinResolution()
      },
      async getZoom () {
        return (await this.resolveView()).getZoom()
      },
      async setZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getZoom()) return

        view.setZoom(zoom)
      },
      async getZoomForResolution (resolution) {
        return (await this.resolveView()).getZoomForResolution(resolution)
      },
      async getMaxZoom () {
        return (await this.resolveView()).getMaxZoom()
      },
      async setMaxZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getMaxZoom()) return

        view.setMaxZoom(zoom)
      },
      async getMinZoom () {
        return (await this.resolveView()).getMinZoom()
      },
      async setMinZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getMinZoom()) return

        return view.setMinZoom(zoom)
      },
      async getProjection () {
        return (await this.resolveView()).getProjection()
      },
      async getRotation () {
        return (await this.resolveView()).getRotation()
      },
      async setRotation (rotation) {
        const view = await this.resolveView()

        if (rotation === view.getRotation()) return

        view.setRotation(rotation)
      },
      async getId () {
        return getViewId(await this.resolveView())
      },
      async setId (id) {
        const view = await this.resolveView()

        if (id === getViewId(view)) return

        setViewId(view, id)
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        if (this.$viewContainer) {
          await this.$viewContainer.setView(this)
        }

        return this::olCmp.methods.mount()
      },
      /**
       * @return {void}
       * @protected
       */
      async unmount () {
        if (this.$viewContainer) {
          await this.$viewContainer.setView(null)
        }

        return this::olCmp.methods.unmount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      subscribeAll () {
        return Promise.all([
          this::olCmp.methods.subscribeAll(),
          this::subscribeToEvents(),
        ])
      },
      resolveView: olCmp.methods.resolveOlObject,
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
        get: () => this.$services?.viewContainer,
      },
    })
  }

  /**
   * Subscribe to OpenLayers significant events
   * @return {void}
   * @private
   */
  async function subscribeToEvents () {
    const view = await this.resolveView()

    const ft = 1000 / 60
    const resolution = obsFromOlChangeEvent(view, 'resolution', true, ft)
    const zoom = resolution.pipe(
      mapObs(() => ({
        prop: 'zoom',
        value: view.getZoom(),
      })),
      distinctUntilKeyChanged('value'),
    )

    const changes = mergeObs(
      obsFromOlChangeEvent(view, 'center', true, ft, () => this.pointToDataProj(view.getCenter())),
      obsFromOlChangeEvent(view, 'rotation', true, ft),
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
