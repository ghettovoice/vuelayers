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
  import { get as getProj } from 'ol/proj'
  import { merge as mergeObs } from 'rxjs'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operators'
  import { olCmp, projTransforms } from '../../mixin'
  import { EPSG_3857, getViewId, initializeView, setViewId } from '../../ol-ext'
  import { obsFromOlChangeEvent } from '../../rx-ext'
  import { coalesce, isArray, isEqual, isFunction, isNumber, isPlainObject, noop, waitFor } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   */
  export default {
    name: 'VlView',
    mixins: [
      projTransforms,
      olCmp,
    ],
    stubVNode: {
      empty () {
        return this.vmId
      },
    },
    props: {
      /**
       * @type {number[]}
       */
      center: {
        type: Array,
        default: () => [0, 0],
        validator: value => value.length === 2 && value.every(isNumber),
      },
      /**
       * @type {boolean}
       */
      constrainOnlyCenter: Boolean,
      /**
       * @type {number[]|undefined}
       */
      extent: {
        type: Array,
        validator: value => value.length === 4 && value.every(isNumber),
      },
      /**
       * @type {boolean}
       */
      smoothExtentConstraint: {
        type: Boolean,
        default: true,
      },
      /**
       * @type {number}
       */
      rotation: {
        type: Number,
        default: 0,
      },
      /**
       * @type {boolean}
       */
      enableRotation: {
        type: Boolean,
        default: true,
      },
      /**
       * @type {boolean|number}
       */
      constrainRotation: {
        type: [Boolean, Number],
        default: true,
      },
      /**
       * @type {number|undefined}
       */
      resolution: Number,
      /**
       * @type {number[]|undefined}
       */
      resolutions: {
        type: Array,
        validator: value => value.every(isNumber),
      },
      /**
       * @type {number|undefined}
       */
      maxResolution: Number,
      /**
       * @type {number|undefined}
       */
      minResolution: Number,
      /**
       * @type {boolean}
       */
      constrainResolution: Boolean,
      /**
       * @type {boolean}
       */
      smoothResolutionConstraint: {
        type: Boolean,
        default: true,
      },
      /**
       * @type {number}
       */
      zoom: {
        type: Number,
        default: 0,
      },
      /**
       * @type {number}
       */
      zoomFactor: {
        type: Number,
        default: 2,
      },
      /**
       * @type {number}
       */
      maxZoom: {
        type: Number,
        default: 28,
      },
      /**
       * @type {number}
       */
      minZoom: {
        type: Number,
        default: 0,
      },
      /**
       * @type {boolean}
       */
      multiWorld: Boolean,
      /**
       * @type {string}
       */
      projection: {
        type: String,
        default: EPSG_3857,
        validator: value => getProj(value) != null,
      },
    },
    computed: {
      /**
       * @type {number}
       */
      currentZoom () {
        if (this.rev && this.$view) {
          return this.$view.getZoom()
        }

        return this.zoom
      },
      /**
       * @type {number}
       */
      currentRotation () {
        if (this.rev && this.$view) {
          return this.$view.getRotation()
        }

        return this.rotation
      },
      /**
       * @type {number}
       */
      currentResolution () {
        if (this.rev && this.$view) {
          return this.$view.getResolution()
        }

        return this.resolution
      },
      /**
       * @type {number[]}
       */
      currentCenter () {
        if (this.rev && this.$view) {
          return this.pointToDataProj(this.$view.getCenter())
        }

        return this.center
      },
      /**
       * @type {number[]}
       */
      currentCenterViewProj () {
        if (this.rev && this.$view) {
          return this.$view.getCenter()
        }

        return this.pointToViewProj(this.center)
      },
      /**
       * @type {number[]|undefined}
       */
      currentExtentViewProj () {
        if (!isArray(this.extent)) return

        return this.extentToViewProj(this.extent)
      },
      /**
       * @return {module:ol/proj~ProjectionLike}
       */
      resolvedDataProjection () {
        // exclude this.projection from lookup to allow view rendering in projection
        // that differs from data projection
        return coalesce(
          this.$mapVm?.resolvedDataProjection,
          this.$options?.dataProjection,
          this.viewProjection,
        )
      },
    },
    watch: {
      async id (value) {
        await this.setId(value)
      },
      async center (value) {
        if (await this.getAnimating()) return

        await this.setCenter(value)
      },
      async rotation (value) {
        if (await this.getAnimating()) return

        await this.setRotation(value)
      },
      async resolution (value) {
        if (await this.getAnimating()) return

        await this.setResolution(value)
      },
      async zoom (value) {
        if (await this.getAnimating()) return

        await this.setZoom(value)
      },
      async minZoom (value) {
        await this.setMinZoom(value)
      },
      async maxZoom (value) {
        await this.setMaxZoom(value)
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
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
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
          center: this.currentCenterViewProj,
          constrainOnlyCenter: this.constrainOnlyCenter,
          extent: this.currentExtentViewProj,
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
       * @return {Promise<string|number|undefined>}
       */
      async getId () {
        return getViewId(await this.resolveView())
      },
      /**
       * @param {number|string|undefined} id
       * @return {Promise<void>}
       */
      async setId (id) {
        const view = await this.resolveView()

        if (id === getViewId(view)) return

        setViewId(view, id)
      },
      /**
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#animate}
       * @param {...(module:ol/View~AnimationOptions|function(boolean))} args
       * @return {Promise<boolean>} Resolves when animation completes
       */
      async animate (...args) {
        let cb = noop
        if (isFunction(args[args.length - 1])) {
          cb = args[args.length - 1]
          args = args.slice(0, args.length - 1)
        }
        args.forEach(opts => {
          if (!isArray(opts.center)) return
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
      /**
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit}
       * @param {Object|module:ol/geom/SimpleGeometry~SimpleGeometry|module:ol/extent~Extent} geometryOrExtent
       * @param {module:ol/View~FitOptions} [options]
       * @return {Promise<boolean>} Resolves when view changes
       */
      async fit (geometryOrExtent, options = {}) {
        // transform from GeoJSON, vl-feature to ol.Feature
        if (isPlainObject(geometryOrExtent)) {
          geometryOrExtent = this.readGeometryInDataProj(geometryOrExtent)
        } else if (isFunction(geometryOrExtent.resolveOlObject)) {
          geometryOrExtent = await geometryOrExtent.resolveOlObject()
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
      /**
       * @return {Promise<boolean>}
       */
      async getAnimating () {
        return (await this.resolveView()).getAnimating()
      },
      /**
       * @return {Promise<void>}
       */
      async cancelAnimations () {
        return (await this.resolveView()).cancelAnimations()
      },
      /**
       * @return {Promise<void>}
       */
      async beginInteraction () {
        (await this.resolveView()).beginInteraction()
      },
      /**
       * @return {Promise<void>}
       */
      async endInteraction (duration, resolutionDirection, anchor) {
        (await this.resolveView()).endInteraction(duration, resolutionDirection, anchor)
      },
      /**
       * @return {Promise<boolean>}
       */
      async getInteracting () {
        return (await this.resolveView()).getInteracting()
      },
      /**
       * @param {number[]|undefined} [size]
       * @return {Promise<number[]>}
       */
      async calculateExtent (size) {
        return this.extentToDataProj((await this.resolveView()).calculateExtent(size))
      },
      /**
       * @param {number[]} coordinate
       * @param {number[]} size
       * @param {number[]} position
       * @return {Promise<void>}
       */
      async centerOn (coordinate, size, position) {
        (await this.resolveView()).centerOn(this.pointToViewProj(coordinate), size, position)
      },
      /**
       * @return {Promise<number[]>}
       */
      async getCenter () {
        return this.pointToDataProj((await this.resolveView()).getCenter())
      },
      /**
       * @param {number[]} center
       * @return {Promise<void>}
       */
      async setCenter (center) {
        center = this.pointToViewProj(center)
        const view = await this.resolveView()

        if (isEqual(center, view.getCenter())) return

        return view.setCenter(center)
      },
      /**
       * @return {Promise<number>}
       */
      async getResolution () {
        return (await this.resolveView()).getResolution()
      },
      /**
       * @param {number} resolution
       * @return {Promise<void>}
       */
      async setResolution (resolution) {
        const view = await this.resolveView()

        if (resolution === view.getResolution()) return

        view.setResolution(resolution)
      },
      /**
       * @param {number[]} extent
       * @param {number[]} size
       * @return {Promise<number>}
       */
      async getResolutionForExtent (extent, size) {
        return (await this.resolveView()).getResolutionForExtent(this.extentToViewProj(extent), size)
      },
      /**
       * @param {number} zoom
       * @return {Promise<number>}
       */
      async getResolutionForZoom (zoom) {
        return (await this.resolveView()).getResolutionForZoom(zoom)
      },
      /**
       * @return {Promise<number[]|undefined>}
       */
      async getResolutions () {
        return (await this.resolveView()).getResolutions()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMaxResolution () {
        return (await this.resolveView()).getMaxResolution()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMinResolution () {
        return (await this.resolveView()).getMinResolution()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getZoom () {
        return (await this.resolveView()).getZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getZoom()) return

        view.setZoom(zoom)
      },
      /**
       * @param {number} resolution
       * @return {Promise<number|undefined>}
       */
      async getZoomForResolution (resolution) {
        return (await this.resolveView()).getZoomForResolution(resolution)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMaxZoom () {
        return (await this.resolveView()).getMaxZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setMaxZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getMaxZoom()) return

        view.setMaxZoom(zoom)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMinZoom () {
        return (await this.resolveView()).getMinZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setMinZoom (zoom) {
        const view = await this.resolveView()

        if (zoom === view.getMinZoom()) return

        return view.setMinZoom(zoom)
      },
      /**
       * @return {Promise<module:ol/proj/Projection>}
       */
      async getProjection () {
        return (await this.resolveView()).getProjection()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getRotation () {
        return (await this.resolveView()).getRotation()
      },
      /**
       * @param {number} rotation
       * @return {Promise<void>}
       */
      async setRotation (rotation) {
        const view = await this.resolveView()

        if (rotation === view.getRotation()) return

        view.setRotation(rotation)
      },
      /**
       * @returns {Promise<void>}
       * @protected
       */
      async init () {
        await waitFor(() => this.$mapVm != null)

        return this::olCmp.methods.init()
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
      async subscribeAll () {
        await Promise.all([
          this::olCmp.methods.subscribeAll(),
          this::subscribeToEvents(),
        ])
      },
      /**
       * @return {Promise<module:ol/View~View>}
       */
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
      /**
       * @type {Object|undefined}
       */
      $viewContainer: {
        enumerable: true,
        get: () => this.$services?.viewContainer,
      },
      /**
       * @type {Object|undefined}
       */
      $mapVm: {
        enumerable: true,
        get: () => this.$services?.mapVm,
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
