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
  import { EPSG_3857, MAX_ZOOM, MIN_ZOOM, ZOOM_FACTOR } from '../../ol-ext'
  import { observableFromOlChangeEvent } from '../../rx-ext'
  import { hasView } from '../../util/assert'
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
        validator: arrayLengthValidator(4),
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
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#animate}
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
       * @return {ol/View~View}
       * @protected
       */
      createOlObject () {
        const view = new View({
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

        view.set('id', this.id)

        return view
      },
      /**
       * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit}
       * @param {Object|module:ol/geom/SimpleGeometry~SimpleGeometry|module:ol/extent~Extent|Vue} geometryOrExtent
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
        this::subscribeToEvents()
      },
    },
    watch: {
      id (value) {
        if (!this.$view || value === this.$view.get('id')) {
          return
        }

        this.$view.set('id', value)
      },
      center (value) {
        if (!this.$view || this.$view.getAnimating()) return

        value = this.pointToViewProj(value)
        if (!isEqual(value, this.currentCenterViewProj)) {
          this.$view.setCenter(value)
        }
      },
      resolution (value) {
        if (!this.$view || this.$view.getAnimating()) return

        if (value !== this.currentResolution) {
          this.$view.setResolution(value)
        }
      },
      zoom (value) {
        if (!this.$view || this.$view.getAnimating()) return

        if (value !== this.currentZoom) {
          this.$view.setZoom(value)
        }
      },
      rotation (value) {
        if (!this.$view || this.$view.getAnimating()) return

        if (value !== this.currentRotation) {
          this.$view.setRotation(value)
        }
      },
      minZoom (value) {
        if (!this.$view) return

        if (value !== this.$view.getMinZoom()) {
          this.$view.setMinZoom(value)
        }
      },
      maxZoom (value) {
        if (!this.$view) return

        if (value !== this.$view.getMaxZoom()) {
          this.$view.setMaxZoom(value)
        }
      },
      ...makeWatchers([
        'resolvedDataProjection',
        'constrainRotation',
        'enableRotation',
        'extent',
        'maxResolution',
        'minResolution',
        'projection',
        'resolutions',
        'zoomFactor',
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
       * @type {ol/View~View|undefined}
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
  function subscribeToEvents () {
    hasView(this)

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
