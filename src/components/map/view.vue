<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :center="currentCenterDataProj"
      :zoom="currentZoom"
      :resolution="currentResolution"
      :rotation="currentRotation"
      :extent="visibleExtentDataProj" />
  </i>
</template>

<script>
  import { View } from 'ol'
  import { get as getProj } from 'ol/proj'
  import { merge as mergeObs } from 'rxjs'
  import { distinctUntilKeyChanged, map as mapObs } from 'rxjs/operators'
  import { makeChangeOrRecreateWatchers, olCmp, projTransforms, waitForMap } from '../../mixins'
  import {
    EPSG_3857,
    getViewId,
    initializeView,
    isGeoJSONGeometry,
    roundExtent,
    roundPointCoords,
    setViewId,
  } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import { addPrefix, assert, coalesce, isArray, isEqual, isFunction, isNumber, noop } from '../../utils'

  /**
   * Represents a simple **2D view** of the map. This is the component to act upon to change the **center**,
   * **resolution**, and **rotation** of the map.
   */
  export default {
    name: 'VlView',
    mixins: [
      projTransforms,
      olCmp,
      waitForMap,
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
        dataProjection: this.projection,
        currentProjection: this.projection,
        currentCenterViewProj: roundPointCoords(this.center),
        currentZoom: this.zoom,
        currentRotation: this.rotation,
        currentResolution: this.resolution,
        currentMinZoom: this.minZoom,
        currentMaxZoom: this.maxZoom,
        currentResolutions: this.resolutions?.slice(),
        currentMaxResolution: this.maxResolution,
        currentMinResolution: this.minResolution,
      }
    },
    computed: {
      centerDataProj () {
        return roundPointCoords(this.center)
      },
      centerViewProj () {
        return this.pointToViewProj(this.center)
      },
      currentCenterDataProj () {
        return this.pointToDataProj(this.currentCenterViewProj)
      },
      extentDataProj () {
        return roundExtent(this.extent)
      },
      extentViewProj () {
        return this.extentToViewProj(this.extent)
      },
      inputResolutions () {
        return this.resolutions?.slice()
      },
      visibleExtentDataProj () {
        if (!this.rev) return

        return this.getExtent()?.slice()
      },
      visibleExtentViewProj () {
        if (!this.rev) return

        return this.getExtent(true)?.slice()
      },
      animating () {
        return !!(this.rev && this.getAnimating())
      },
      interacting () {
        return !!(this.rev && this.getInteracting())
      },
      resolvedViewProjection () {
        return this.currentProjection
      },
    },
    watch: {
      rev () {
        if (!this.$view) return

        if (this.currentProjection !== this.$view.getProjection().getCode()) {
          this.currentProjection = this.$view.getProjection().getCode()
        }
        if (!isEqual(this.currentCenterViewProj, this.$view.getCenter())) {
          this.currentCenterViewProj = this.$view.getCenter()
        }
        if (this.currentZoom !== this.$view.getZoom()) {
          this.currentZoom = this.$view.getZoom()
        }
        if (this.currentRotation !== this.$view.getRotation()) {
          this.currentRotation = this.$view.getRotation()
        }
        if (this.currentResolution !== this.$view.getResolution()) {
          this.currentResolution = this.$view.getResolution()
        }
        if (this.currentMinZoom !== this.$view.getMinZoom()) {
          this.currentMinZoom = this.$view.getMinZoom()
        }
        if (this.currentMaxZoom !== this.$view.getMaxZoom()) {
          this.currentMaxZoom = this.$view.getMaxZoom()
        }
        if (!isEqual(this.currentResolutions, this.$view.getResolutions())) {
          this.currentResolutions = this.$view.getResolutions()
        }
        if (this.currentMaxResolution !== this.$view.getMaxResolution()) {
          this.currentMaxResolution = this.$view.getMaxResolution()
        }
        if (this.currentMinResolution !== this.$view.getMinResolution()) {
          this.currentMinResolution = this.$view.getMinResolution()
        }
      },
      centerViewProj: {
        deep: true,
        handler (value, prev) {
          if (this.getAnimating()) return

          this.setCenter(value, true)
        },
      },
      currentCenterDataProj: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, this.centerDataProj)) return

          this.$emit('update:center', value.slice())
        },
      },
      rotation (value) {
        if (this.getAnimating()) return

        this.setRotation(value)
      },
      currentRotation (value) {
        if (value === this.rotation) return

        this.$emit('update:rotation', value)
      },
      resolution (value) {
        if (this.getAnimating()) return

        this.setResolution(value)
      },
      currentResolution (value) {
        if (value === this.resolution) return

        this.$emit('update:resolution', value)
      },
      constrainResolution (value) {
        this.setConstrainResolution(value)
      },
      zoom (value) {
        if (this.getAnimating()) return

        this.setZoom(value)
      },
      currentZoom (value) {
        if (value === this.zoom) return

        this.$emit('update:zoom', value)
      },
      minZoom (value) {
        this.setMinZoom(value)
      },
      currentMinZoom (value) {
        if (value === this.minZoom) return

        this.$emit('update:minZoom', value)
      },
      maxZoom (value) {
        this.setMaxZoom(value)
      },
      currentMaxZoom (value) {
        if (value === this.maxZoom) return

        this.$emit('update:maxZoom', value)
      },
      inputResolutions: {
        deep: true,
        handler (value) {
          if (value === this.currentResolutions) return

          if (process.env.VUELAYERS_DEBUG) {
            this.$logger.log(
              'resolutions changed, scheduling recreate... %O ===> %O',
              this.currentResolutions,
              value,
            )
          }

          this.currentResolutions = value?.slice()

          return this.scheduleRecreate()
        },
      },
      currentResolutions: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.inputResolutions)) return

          this.$emit('update:resolutions', value?.slice())
        },
      },
      maxResolution (value) {
        if (value === this.currentMaxResolution) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(
            'maxResolution changed, scheduling recreate... %O ===> %O',
            this.currentMaxResolution,
            value,
          )
        }

        this.currentMaxResolution = value

        return this.scheduleRecreate()
      },
      currentMaxResolution (value) {
        if (value === this.maxResolution) return

        this.$emit('update:maxResolution', value)
      },
      minResolution (value) {
        if (value === this.currentMinResolution) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(
            'minResolution changed, scheduling recreate... %O ===> %O',
            this.currentMinResolution,
            value,
          )
        }

        this.currentMinResolution = value

        return this.scheduleRecreate()
      },
      currentMinResolution (value) {
        if (value === this.minResolution) return

        this.$emit('update:minResolution', value)
      },
      projection (value) {
        if (value === this.currentProjection) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(
            'projection changed, scheduling recreate... %O ===> %O',
            this.currentProjection,
            value,
          )
        }

        this.currentProjection = this.dataProjection = value
        // reset current resolution fields to inputs
        // so zoom fields will take precedence
        this.currentResolution = this.resolution
        this.currentResolutions = this.inputResolutions?.slice()
        this.currentMaxResolution = this.maxResolution
        this.currentMinResolution = this.minResolution

        return this.scheduleRecreate()
      },
      currentProjection (value) {
        if (value === this.projection) return

        this.$emit('update:projection', value)
      },
      animating (value, prev) {
        if (value === prev) return

        this.$emit('update:animating', value)
      },
      interacting (value, prev) {
        if (value === prev) return

        this.$emit('update:interacting', value)
      },
      visibleExtentDataProj: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:visibleExtent', value?.slice())
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'constrainOnlyCenter',
        'smoothExtentConstraint',
        'enableRotation',
        'constrainRotation',
        'constrainResolution',
        'smoothResolutionConstraint',
        'zoomFactor',
        'multiWorld',
        'extentViewProj',
      ], [
        'extentViewProj',
      ]),
    },
    created () {
      this::defineServices()

      this.currentCenterViewProj = this.centerViewProj.slice()
    },
    methods: {
      /**
       * @return {Promise<void>}
       * @protected
       */
      async beforeInit () {
        await Promise.all([
          this::olCmp.methods.beforeInit(),
          this::waitForMap.methods.beforeInit(),
        ])
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
          resolutions: this.currentResolutions,
          maxResolution: this.currentMaxResolution,
          minResolution: this.currentMinResolution,
          constrainResolution: this.constrainResolution,
          smoothResolutionConstraint: this.smoothResolutionConstraint,
          zoom: this.currentZoom,
          zoomFactor: this.zoomFactor,
          maxZoom: this.currentMaxZoom,
          minZoom: this.currentMinZoom,
          multiWorld: this.multiWorld,
          projection: this.currentProjection,
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
        this.$viewContainer?.setView(this)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {void}
       * @protected
       */
      async unmount () {
        if (this.$viewContainer?.getViewVm() === this) {
          this.$viewContainer.setView(null)
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
       * @return {*}
       * @protected
       */
      getIdInternal () {
        return getViewId(this.$view)
      },
      /**
       * @param {*} id
       * @protected
       */
      setIdInternal (id) {
        if (id === this.getIdInternal()) return

        setViewId(this.$view, id)
      },
      /**
       * @return {Promise<module:ol/View~View>}
       */
      resolveView: olCmp.methods.resolveOlObject,
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
       * @return {Promise<void>}
       */
      async cancelAnimations () {
        (await this.resolveView()).cancelAnimations()
      },
      /**
       * @return {boolean}
       */
      getAnimating () {
        return coalesce(this.$view?.getAnimating(), false)
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
       * @return {boolean}
       */
      getInteracting () {
        return coalesce(this.$view?.getInteracting(), false)
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
       * @param {boolean} [viewProj=false]
       * @return {number[]|undefined}
       */
      getExtent (viewProj = false) {
        if (!this.$view) return

        const extent = this.$view.calculateExtent()
        if (viewProj) return roundExtent(extent)

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
       * @return {number[]}
       */
      getCenter (viewProj = false) {
        if (!this.$view) {
          return viewProj ? this.currentCenterViewProj : this.currentCenterDataProj
        }

        const center = this.$view.getCenter()
        if (viewProj) return center

        return this.pointToDataProj(center)
      },
      /**
       * @param {number[]} center
       * @param {boolean} [viewProj=false]
       */
      setCenter (center, viewProj = false) {
        assert(isArray(center) && center.length === 2, 'Invalid center')

        if (viewProj) {
          center = roundPointCoords(center)
        } else {
          center = this.pointToViewProj(center)
        }

        if (!isEqual(center, this.currentCenterViewProj)) {
          this.currentCenterViewProj = center
        }
        if (this.$view && !isEqual(center, this.$view.getCenter())) {
          this.$view.setCenter(center)
        }
      },
      /**
       * @return {number}
       */
      getResolution () {
        return coalesce(this.$view?.getResolution(), this.currentResolution)
      },
      /**
       * @param {number} resolution
       */
      setResolution (resolution) {
        resolution = Number(resolution)
        assert(isNumber(resolution), 'Invalid resolution')

        if (resolution !== this.currentResolution) {
          this.currentResolution = resolution
        }
        if (this.$view && resolution !== this.$view.getResolution()) {
          this.$view.setResolution(resolution)
        }
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
       * @return {number[]|undefined}
       */
      getResolutions () {
        return coalesce(this.$view?.getResolutions(), this.currentResolutions)
      },
      /**
       * @return {number|undefined}
       */
      getMaxResolution () {
        return coalesce(this.$view?.getMaxResolution(), this.currentMaxResolution)
      },
      /**
       * @return {number|undefined}
       */
      getMinResolution () {
        return coalesce(this.$view?.getMinResolution(), this.currentMinResolution)
      },
      /**
       * @return {number|undefined}
       */
      getZoom () {
        return coalesce(this.$view?.getZoom(), this.currentZoom)
      },
      /**
       * @param {number} zoom
       */
      setZoom (zoom) {
        zoom = Number(zoom)
        assert(isNumber(zoom), 'Invalid zoom')

        if (zoom !== this.currentZoom) {
          this.currentZoom = zoom
        }
        if (this.$view && zoom !== this.$view.getZoom()) {
          this.$view.setZoom(zoom)
        }
      },
      /**
       * @param {number} resolution
       * @return {Promise<number|undefined>}
       */
      async getZoomForResolution (resolution) {
        return (await this.resolveView()).getZoomForResolution(resolution)
      },
      /**
       * @return {number|undefined}
       */
      getMaxZoom () {
        return coalesce(this.$view?.getMaxZoom(), this.currentMaxZoom)
      },
      /**
       * @param {number} zoom
       */
      setMaxZoom (zoom) {
        zoom = Number(zoom)
        assert(isNumber(zoom), 'Invalid maxZoom')

        if (zoom !== this.currentMaxZoom) {
          this.currentMaxZoom = zoom
        }
        if (this.$view && zoom !== this.$view.getMaxZoom()) {
          this.$view.setMaxZoom(zoom)
        }
      },
      /**
       * @return {number|undefined}
       */
      getMinZoom () {
        return coalesce(this.$view?.getMinZoom(), this.currentMinZoom)
      },
      /**
       * @param {number} zoom
       */
      setMinZoom (zoom) {
        zoom = Number(zoom)
        assert(isNumber(zoom), 'Invalid minZoom')

        if (zoom !== this.currentMinZoom) {
          this.currentMinZoom = zoom
        }
        if (this.$view && zoom !== this.$view.getMinZoom()) {
          this.$view.setMinZoom(zoom)
        }
      },
      /**
       * @return {module:ol/proj/ProjectionLike}
       */
      getProjection () {
        return coalesce(this.$view?.getProjection(), getProj(this.currentProjection))
      },
      /**
       * @return {number|undefined}
       */
      getRotation () {
        return coalesce(this.$view?.getRotation(), this.currentRotation)
      },
      /**
       * @param {number} rotation
       */
      setRotation (rotation) {
        rotation = Number(rotation)
        assert(isNumber(rotation), 'Invalid rotation')

        if (rotation !== this.currentRotation) {
          this.currentRotation = rotation
        }
        if (this.$view && rotation !== this.$view.getRotation()) {
          this.$view.setRotation(rotation)
        }
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
    const setterKey = addPrefix('set')
    const resolutionChanges = obsFromOlChangeEvent(this.$view, 'resolution', true)
    const zoomChanges = resolutionChanges.pipe(
      mapObs(() => ({
        prop: 'zoom',
        value: this.getZoom(),
      })),
      distinctUntilKeyChanged('value'),
    )
    const propChanges = mergeObs(
      obsFromOlChangeEvent(this.$view, [
        'id',
        'rotation',
        'center',
      ], true),
      resolutionChanges,
      zoomChanges,
    ).pipe(
      mapObs(evt => ({
        ...evt,
        setter: val => {
          const args = [val]
          if (evt.prop === 'center') {
            args.push(true)
          }
          this[setterKey(evt.prop)](...args)
        },
      })),
    )
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
  }
</script>
