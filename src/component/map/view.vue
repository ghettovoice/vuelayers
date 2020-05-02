<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :center="currentCenterDataProj"
      :zoom="currentZoom"
      :resolution="currentResolution"
      :rotation="currentRotation" />
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import { View } from 'ol'
  import GeometryType from 'ol/geom/GeometryType'
  import { get as getProj } from 'ol/proj'
  import { from as fromObs, merge as mergeObs } from 'rxjs'
  import { distinctUntilKeyChanged, map as mapObs, mergeMap, skipWhile } from 'rxjs/operators'
  import { FRAME_TIME, olCmp, OlObjectEvent, projTransforms } from '../../mixin'
  import { EPSG_3857, getViewId, initializeView, roundCoords, roundExtent, setViewId } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent, fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import {
    addPrefix,
    coalesce,
    hasProp,
    isArray,
    isEqual,
    isFunction,
    isNumber,
    isPlainObject,
    noop,
  } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'
  import waitFor from '../../util/wait-for'

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
      showFullExtent: Boolean,
    },
    data () {
      return {
        dataProjection: null,
      }
    },
    computed: {
      centerDataProj () {
        return roundCoords(GeometryType.POINT, this.center)
      },
      centerViewProj () {
        return this.pointToViewProj(this.center)
      },
      extentDataProj () {
        return this.extent && roundExtent(this.extent)
      },
      extentViewProj () {
        return this.extent && this.extentToViewProj(this.extent)
      },
      currentId () {
        if (this.rev && this.$view) {
          return getViewId(this.$view)
        }

        return this.id
      },
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
      currentCenterDataProj () {
        if (this.rev && this.$view) {
          return this.pointToDataProj(this.$view.getCenter())
        }

        return this.centerDataProj
      },
      /**
       * @type {number[]}
       */
      currentCenterViewProj () {
        if (this.rev && this.$view) {
          return this.$view.getCenter()
        }

        return this.centerViewProj
      },
      /**
       * @return {module:ol/proj~ProjectionLike}
       */
      resolvedDataProjection () {
        // exclude this.projection from lookup to allow view rendering in projection
        // that differs from data projection
        return coalesce(
          this.dataProjection,
          this.$mapVm?.resolvedDataProjection,
          this.$options?.dataProjection,
          this.viewProjection,
        )
      },
    },
    watch: {
      async centerDataProj (value) {
        if (await this.getAnimating()) return

        await this.setCenter(value)
      },
      currentCenterDataProj: {
        deep: true,
        handler: debounce(function (value) {
          if (isEqual(value, this.centerDataProj)) return

          this.$emit('update:center', value.slice())
        }, FRAME_TIME),
      },
      async rotation (value) {
        if (await this.getAnimating()) return

        await this.setRotation(value)
      },
      currentRotation: debounce(function (value) {
        if (value === this.rotation) return

        this.$emit('update:rotation', value)
      }, FRAME_TIME),
      async resolution (value) {
        if (await this.getAnimating()) return

        await this.setResolution(value)
      },
      currentResolution: debounce(function (value) {
        if (value === this.resolution) return

        this.$emit('update:resolution', value)
      }, FRAME_TIME),
      async zoom (value) {
        if (await this.getAnimating()) return

        await this.setZoom(value)
      },
      currentZoom: debounce(function (value) {
        if (value === this.zoom) return

        this.$emit('update:zoom', value)
      }, FRAME_TIME),
      async minZoom (value) {
        await this.setMinZoom(value)
      },
      async maxZoom (value) {
        await this.setMaxZoom(value)
      },
      ...makeWatchers([
        'constrainOnlyCenter',
        'extentDataProj',
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
       * @returns {Promise<void>}
       * @protected
       */
      async beforeInit () {
        try {
          await waitFor(
            () => this.$mapVm != null,
            obsFromVueEvent(this.$eventBus, [
              OlObjectEvent.CREATE_ERROR,
            ]).pipe(
              mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
            ),
            1000,
          )
          this.dataProjection = this.$mapVm.resolvedDataProjection
          await this.$nextTickPromise()

          return this::olCmp.methods.beforeInit()
        } catch (err) {
          err.message = 'Wait for $mapVm injection: ' + err.message
          throw err
        }
      },
      /**
       * @return {module:ol/View~View}
       * @protected
       */
      createOlObject () {
        const view = new View({
          center: this.currentCenterViewProj,
          constrainOnlyCenter: this.constrainOnlyCenter,
          extent: this.extentViewProj,
          smoothExtentConstraint: this.smoothExtentConstraint,
          rotation: this.currentRotation,
          enableRotation: this.enableRotation,
          constrainRotation: this.constrainRotation,
          resolution: this.currentResolution,
          resolutions: this.resolutions,
          maxResolution: this.maxResolution,
          minResolution: this.minResolution,
          constrainResolution: this.constrainResolution,
          smoothResolutionConstraint: this.smoothResolutionConstraint,
          zoom: this.currentZoom,
          zoomFactor: this.zoomFactor,
          maxZoom: this.maxZoom,
          minZoom: this.minZoom,
          multiWorld: this.multiWorld,
          projection: this.projection,
          showFullExtent: this.showFullExtent,
        })
        initializeView(view, this.currentId)

        return view
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
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::olCmp.methods.subscribeAll()
        this::subscribeToEvents()
      },
      /**
       * @return {Promise<module:ol/View~View>}
       */
      resolveView: olCmp.methods.resolveOlObject,
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
        if (id === getViewId(await this.resolveView())) return

        setViewId(await this.resolveView(), id)
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
        if (isEqual(center, await this.getCenter())) return

        (await this.resolveView()).setCenter(this.pointToViewProj(center))
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
        if (resolution === (await this.resolveView()).getResolution()) return

        (await this.resolveView()).setResolution(resolution)
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
        if (zoom === (await this.resolveView()).getZoom()) return

        (await this.resolveView()).setZoom(zoom)
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
        if (zoom === (await this.resolveView()).getMaxZoom()) return

        (await this.resolveView()).setMaxZoom(zoom)
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
        if (zoom === (await this.resolveView()).getMinZoom()) return

        (await this.resolveView()).setMinZoom(zoom)
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
        if (rotation === (await this.resolveView()).getRotation()) return

        (await this.resolveView()).setRotation(rotation)
      },
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
    const prefixKey = addPrefix('current')
    const resolutionChanges = obsFromOlChangeEvent(this.$view, 'resolution', true, evt => ({
      ...evt,
      compareWith: this.currentResolution,
    }))
    const zoomChanges = resolutionChanges.pipe(
      mergeMap(() => fromObs(this.getZoom()).pipe(
        mapObs(zoom => ({
          prop: 'zoom',
          value: zoom,
          compareWith: this.currentZoom,
        })),
      )),
      distinctUntilKeyChanged('value'),
    )
    const centerChanges = obsFromOlChangeEvent(this.$view, 'center', true).pipe(
      mergeMap(({ prop }) => fromObs(this.getCenter()).pipe(
        mapObs(center => ({
          prop,
          value: center,
          compareWith: this.currentCenterDataProj,
        })),
      )),
    )
    const propChanges = mergeObs(
      obsFromOlChangeEvent(this.$view, [
        'id',
        'rotation',
      ], true, evt => ({
        ...evt,
        compareWith: this[prefixKey(evt.prop)],
      })),
      resolutionChanges,
      zoomChanges,
      centerChanges,
    ).pipe(
      skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
    )
    this.subscribeTo(propChanges, () => {
      ++this.rev
    })
  }
</script>
