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
  import {
    EPSG_3857,
    getViewId,
    initializeView,
    isGeoJSONGeometry,
    roundCoords,
    roundExtent,
    roundPointCoords,
    setViewId,
  } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent, fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import { assert } from '../../util/assert'
  import { addPrefix, coalesce, hasProp, isArray, isEqual, isFunction, isNumber, noop } from '../../util/minilo'
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
        return roundExtent(this.extent)
      },
      extentViewProj () {
        return this.extentToViewProj(this.extent)
      },
      currentZoom () {
        if (this.rev && this.$view) {
          return this.getZoomInternal()
        }

        return this.zoom
      },
      currentRotation () {
        if (this.rev && this.$view) {
          return this.getRotationInternal()
        }

        return this.rotation
      },
      currentResolution () {
        if (this.rev && this.$view) {
          return this.getResolutionInternal()
        }

        return this.resolution
      },
      currentCenterDataProj () {
        if (this.rev && this.$view) {
          return this.getCenterInternal()
        }

        return this.centerDataProj
      },
      currentCenterViewProj () {
        if (this.rev && this.$view) {
          return this.getCenterInternal(true)
        }

        return this.centerViewProj
      },
      currentAnimating () {
        if (!(this.rev && this.$view)) return false

        return this.getAnimatingInternal()
      },
      currentInteracting () {
        if (!(this.rev && this.$view)) return false

        return this.getInteractingInteraction()
      },
      currentResolutions () {
        if (!(this.rev && this.$view)) return false

        return this.getResolutionsInternal()
      },
      currentMaxResolution () {
        if (!(this.rev && this.$view)) return false

        return this.getMaxResolutionInternal()
      },
      currentMinResolution () {
        if (!(this.rev && this.$view)) return false

        return this.getMinResolutionInternal()
      },
      currentMaxZoom () {
        if (!(this.rev && this.$view)) return false

        return this.getMaxZoomInternal()
      },
      currentMinZoom () {
        if (!(this.rev && this.$view)) return false

        return this.getMinZoomInternal()
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
        handler: /*#__PURE__*/debounce(function (value) {
          if (isEqual(value, this.centerDataProj)) return

          this.$emit('update:center', value.slice())
        }, FRAME_TIME),
      },
      async rotation (value) {
        if (await this.getAnimating()) return

        await this.setRotation(value)
      },
      currentRotation: /*#__PURE__*/debounce(function (value) {
        if (value === this.rotation) return

        this.$emit('update:rotation', value)
      }, FRAME_TIME),
      async resolution (value) {
        if (await this.getAnimating()) return

        await this.setResolution(value)
      },
      currentResolution: /*#__PURE__*/debounce(function (value) {
        if (value === this.resolution) return

        this.$emit('update:resolution', value)
      }, FRAME_TIME),
      async zoom (value) {
        if (await this.getAnimating()) return

        await this.setZoom(value)
      },
      currentZoom: /*#__PURE__*/debounce(function (value) {
        if (value === this.zoom) return

        this.$emit('update:zoom', value)
      }, FRAME_TIME),
      async minZoom (value) {
        await this.setMinZoom(value)
      },
      async maxZoom (value) {
        await this.setMaxZoom(value)
      },
      currentAnimating: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:animating', value)
      }),
      currentInteracting: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:interacting', value)
      }),
      currentResolutions: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:resolutions', value)
      }),
      currentMaxResolution: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:maxResolution', value)
      }),
      currentMinResolution: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:minResolution', value)
      }),
      currentMaxZoom: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:maxZoom', value)
      }),
      currentMinZoom: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:minZoom', value)
      }),
      .../*#__PURE__*/makeWatchers([
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
      getIdInternal () {
        return getViewId(this.$view)
      },
      /**
       * @param {number|string|undefined} id
       * @return {Promise<void>}
       */
      setIdInternal (id) {
        assert(id != null && id !== '', 'Invalid view id')

        if (id === this.getIdInternal()) return

        setViewId(this.$view, id)
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
          if (!opts.viewProj) {
            opts.center = this.pointToViewProj(opts.center)
          }
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
        if (isGeoJSONGeometry(geometryOrExtent)) {
          if (options.viewProj) {
            geometryOrExtent = this.readGeometryInViewProj(geometryOrExtent)
          } else {
            geometryOrExtent = this.readGeometryInDataProj(geometryOrExtent)
          }
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
        await this.resolveView()

        return this.getAnimatingInternal()
      },
      /**
       * @return {boolean}
       * @protected
       */
      getAnimatingInternal () {
        return this.$view.getAnimating()
      },
      /**
       * @return {Promise<void>}
       */
      async cancelAnimations () {
        (await this.resolveView()).cancelAnimations()
      },
      /**
       * @return {Promise<void>}
       */
      async beginInteraction () {
        (await this.resolveView()).beginInteraction()
      },
      /**
       * @param {number} [duration]
       * @param {number} [resolutionDirection]
       * @param {number[]} [anchor]
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async endInteraction (duration, resolutionDirection, anchor, viewProj = false) {
        if (!viewProj) {
          anchor = this.pointToViewProj(anchor)
        }

        (await this.resolveView()).endInteraction(duration, resolutionDirection, anchor)
      },
      /**
       * @return {Promise<boolean>}
       */
      async getInteracting () {
        await this.resolveView()

        return this.getInteractingInteraction()
      },
      /**
       * @return {boolean}
       * @protected
       */
      getInteractingInteraction () {
        return this.$view.getInteracting()
      },
      /**
       * @param {number[]|undefined} [size]
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>}
       */
      async calculateExtent (size, viewProj = false) {
        const extent = (await this.resolveView()).calculateExtent(size)
        if (viewProj) {
          return roundExtent(extent)
        }

        return this.extentToDataProj(extent)
      },
      /**
       * @param {number[]} coordinate
       * @param {number[]} size
       * @param {number[]} position
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async centerOn (coordinate, size, position, viewProj = false) {
        if (!viewProj) {
          coordinate = this.pointToViewProj(coordinate)
        }

        (await this.resolveView()).centerOn(coordinate, size, position)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {Promise<number[]>}
       */
      async getCenter (viewProj = false) {
        await this.resolveView()

        return this.getCenterInternal(viewProj)
      },
      /**
       * @param {boolean} [viewProj=false]
       * @return {number[]}
       */
      getCenterInternal (viewProj = false) {
        if (viewProj) {
          return roundCoords(this.$view.getCenter())
        }

        return this.pointToDataProj(this.$view.getCenter())
      },
      /**
       * @param {number[]} center
       * @param {boolean} [viewProj=false]
       * @return {Promise<void>}
       */
      async setCenter (center, viewProj = false) {
        center = roundPointCoords(center)
        if (isEqual(center, await this.getCenter(viewProj))) return
        if (!viewProj) {
          center = this.pointToViewProj(center)
        }

        (await this.resolveView()).setCenter(center)
      },
      /**
       * @return {Promise<number>}
       */
      async getResolution () {
        await this.resolveView()

        return this.getResolutionInternal()
      },
      /**
       * @return {number}
       */
      getResolutionInternal () {
        return this.$view.getResolution()
      },
      /**
       * @param {number} resolution
       * @return {Promise<void>}
       */
      async setResolution (resolution) {
        if (resolution === await this.getResolution()) return

        (await this.resolveView()).setResolution(resolution)
      },
      /**
       * @param {number[]} extent
       * @param {number[]} size
       * @param {boolean} [viewProj=false]
       * @return {Promise<number>}
       */
      async getResolutionForExtent (extent, size, viewProj = false) {
        if (!viewProj) {
          extent = this.extentToViewProj(extent)
        }

        return (await this.resolveView()).getResolutionForExtent(extent, size)
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
        await this.resolveView()

        return this.getResolutionsInternal()
      },
      /**
       * @return {number[]|undefined}
       * @protected
       */
      getResolutionsInternal () {
        return this.$view.getResolutions()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMaxResolution () {
        await this.resolveView()

        return this.getMaxResolutionInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getMaxResolutionInternal () {
        return this.$view.getMaxResolution()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMinResolution () {
        await this.resolveView()

        return this.getMinResolutionInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getMinResolutionInternal () {
        this.$view.getMinResolution()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getZoom () {
        await this.resolveView()

        return this.getZoomInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getZoomInternal () {
        return this.$view.getZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setZoom (zoom) {
        if (zoom === await this.getZoom()) return

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
        await this.resolveView()

        return this.getMaxZoomInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getMaxZoomInternal () {
        return this.$view.getMaxZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setMaxZoom (zoom) {
        if (zoom === await this.getMaxZoom()) return

        (await this.resolveView()).setMaxZoom(zoom)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getMinZoom () {
        await this.resolveView()

        return this.getMinZoomInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getMinZoomInternal () {
        return this.$view.getMinZoom()
      },
      /**
       * @param {number} zoom
       * @return {Promise<void>}
       */
      async setMinZoom (zoom) {
        if (zoom === await this.getMinZoom()) return

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
        await this.resolveView()

        return this.getRotationInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getRotationInternal () {
        return this.$view.getRotation()
      },
      /**
       * @param {number} rotation
       * @return {Promise<void>}
       */
      async setRotation (rotation) {
        if (rotation === await this.getRotation()) return

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
