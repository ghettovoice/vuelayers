<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :accuracy="currentAccuracy"
      :accuracy-geometry="currentAccuracyGeometryDataProj"
      :altitude="currentAltitude"
      :altitude-accuracy="currentAltitudeAccuracy"
      :heading="currentHeading"
      :position="currentPositionDataProj"
      :speed="currentSpeed" />
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import { Geolocation } from 'ol'
  import { equivalent as isEqProj, get as getProj } from 'ol/proj'
  import { from as fromObs, merge as mergeObs } from 'rxjs'
  import { filter as filterObs, map as mapObs, mapTo, mergeMap, skipWhile } from 'rxjs/operators'
  import { FRAME_TIME, isCreateError, olCmp, OlObjectEvent, projTransforms } from '../../mixins'
  import { EPSG_3857, EPSG_4326 } from '../../ol-ext'
  import {
    fromOlChangeEvent as obsFromOlChangeEvent,
    fromVueEvent as obsFromVueEvent,
    fromVueWatcher as obsFromVueWatcher,
  } from '../../rx-ext'
  import { addPrefix, assert, clonePlainObject, coalesce, hasProp, isEqual, stubTrue, waitFor } from '../../utils'

  export default {
    name: 'VlGeoloc',
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
      tracking: {
        type: Boolean,
        default: true,
      },
      trackingOptions: Object,
      projection: {
        type: String,
        default: EPSG_4326,
        validator: value => getProj(value) != null,
      },
    },
    data () {
      return {
        viewProjection: EPSG_3857,
        dataProjection: EPSG_3857,
      }
    },
    computed: {
      currentTracking () {
        if (this.rev && this.$geolocation) {
          return this.getTrackingInternal()
        }

        return this.tracking
      },
      currentTrackingOptions () {
        if (this.rev && this.$geolocation) {
          return this.getTrackingOptionsInternal()
        }

        return this.trackingOptions
      },
      currentProjection () {
        if (this.rev && this.$geolocation) {
          return getProj(this.getProjectionInternal()).getCode()
        }

        return this.projection
      },
      resolvedDataProjection () {
        return coalesce(
          this.currentProjection, // may or may not be present
          this.$options?.dataProjection, // may or may not be present
          this.dataProjection, // may or may not be present
          this.resolvedViewProjection,
        )
      },
      currentAccuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAccuracyInternal()
      },
      currentAccuracyGeometryDataProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.writeGeometryInDataProj(this.getAccuracyGeometryInternal())
      },
      currentAccuracyGeometryViewProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.writeGeometryInViewProj(this.getAccuracyGeometryInternal())
      },
      currentAltitude () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAltitudeInternal()
      },
      currentAltitudeAccuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAltitudeAccuracyInternal()
      },
      currentHeading () {
        if (!(this.rev && this.$geolocation)) return

        return this.getHeadingInternal()
      },
      currentSpeed () {
        if (!(this.rev && this.$geolocation)) return

        return this.getSpeedInternal()
      },
      currentPositionDataProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.getPositionInternal()
      },
      currentPositionViewProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.pointToViewProj(this.getPositionInternal())
      },
    },
    watch: {
      async tracking (value) {
        await this.setTracking(value)
      },
      currentTracking: /*#__PURE__*/debounce(function (value) {
        if (value === this.tracking) return

        this.$emit('update:tracking', value)
      }, FRAME_TIME),
      async tracingOptions (value) {
        await this.setTrackingOptions(value)
      },
      currentTrackingOptions: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value) {
          if (isEqual(value, this.trackingOptions)) return

          value && (value = clonePlainObject(value))
          this.$emit('update:tracingOptions', value)
        }, FRAME_TIME),
      },
      currentProjection: /*#__PURE__*/debounce(function (value) {
        if (value === this.projection) return

        this.$emit('update:projection', value)
      }, FRAME_TIME),
      currentAccuracy: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:accuracy', value)
      }, FRAME_TIME),
      currentAccuracyGeometryDataProj: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:accuracyGeometry', value)
      }, FRAME_TIME),
      currentAltitude: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:altitude', value)
      }, FRAME_TIME),
      currentAltitudeAccuracy: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:altitudeAccuracy', value)
      }, FRAME_TIME),
      currentHeading: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:heading', value)
      }, FRAME_TIME),
      currentSpeed: /*#__PURE__*/debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:speed', value)
      }, FRAME_TIME),
      currentPositionDataProj: /*#__PURE__*/debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:position', value)
      }, FRAME_TIME),
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
            obsFromVueEvent(this.$eventBus, OlObjectEvent.ERROR).pipe(
              filterObs(([err, vm]) => {
                return isCreateError(err) &&
                  hasProp(vm, '$map') &&
                  this.$vq.closest(vm)
              }),
              mapTo(stubTrue()),
            ),
          )
          this.viewProjection = this.$mapVm.resolvedViewProjection
          this.dataProjection = this.$mapVm.resolvedDataProjection
          this.subscribeTo(
            obsFromVueWatcher(this, () => this.$mapVm.resolvedViewProjection),
            ({ value }) => { this.viewProjection = value },
          )
          this.subscribeTo(
            obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection),
            ({ value }) => { this.dataProjection = value },
          )
          await this.$nextTickPromise()

          return this::olCmp.methods.beforeInit()
        } catch (err) {
          err.message = `${this.vmName} wait for $mapVm injection: ${err.message}`
          throw err
        }
      },
      /**
       * @return {module:ol/Geolocation~Geolocation}
       * @private
       */
      createOlObject () {
        const geoloc = new Geolocation({
          tracking: this.tracking,
          trackingOptions: this.trackingOptions,
          projection: this.resolvedDataProjection,
        })
        geoloc.set('id', this.currentId)

        return geoloc
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        await this.setTracking(this.tracking)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        await this.setTracking(false)

        return this::olCmp.methods.unmount()
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::olCmp.methods.subscribeAll()
        this::subscribeToGeolocation()
      },
      resolveGeolocation: olCmp.methods.resolveOlObject,
      /**
       * @return {number|string}
       */
      getIdInternal () {
        return this.$geolocation.get('id')
      },
      /**
       * @param {string|number} id
       * @return {void}
       */
      setIdInternal (id) {
        assert(id != null && id !== '', 'Invalid geolocation id')

        if (id === this.getIdInternal()) return

        this.$geolocation.set('id', id)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAccuracy () {
        await this.resolveGeolocation()

        return this.getAccuracyInternal()
      },
      /**
       * @return {number}
       * @protected
       */
      getAccuracyInternal () {
        return this.$geolocation.getAccuracy()
      },
      /**
       * @return {Promise<module:/ol/geom/Geometry~Geometry|undefined>}
       */
      async getAccuracyGeometry () {
        await this.resolveGeolocation()

        return this.getAccuracyGeometryInternal()
      },
      /**
       * @return {module:/ol/geom/Geometry~Geometry|undefined}
       * @protected
       */
      getAccuracyGeometryInternal () {
        return this.$geolocation.getAccuracyGeometry()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitude () {
        await this.resolveGeolocation()

        return this.getAltitudeInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getAltitudeInternal () {
        return this.$geolocation.getAltitude()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitudeAccuracy () {
        await this.resolveGeolocation()

        return this.getAltitudeAccuracyInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getAltitudeAccuracyInternal () {
        return this.$geolocation.getAltitudeAccuracy()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getHeading () {
        await this.resolveGeolocation()

        return this.getHeadingInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getHeadingInternal () {
        return this.$geolocation.getHeading()
      },
      /**
       * @return {Promise<number[]|undefined>}
       */
      async getPosition () {
        await this.resolveGeolocation()

        return this.getPositionInternal()
      },
      /**
       * @return {number[]|undefined}
       * @protected
       */
      getPositionInternal () {
        return this.$geolocation.getPosition()
      },
      /**
       * @return {Promise<module:ol/proj~ProjectionLike|undefined>}
       */
      async getProjection () {
        await this.resolveGeolocation()

        return this.getProjectionInternal()
      },
      /**
       * @return {module:ol/proj~ProjectionLike|undefined}
       * @protected
       */
      getProjectionInternal () {
        return this.$geolocation.getProjection()
      },
      /**
       * @param {module:ol/proj~ProjectionLike} projection
       * @return {Promise<void>}
       */
      async setProjection (projection) {
        projection = getProj(projection)
        if (isEqProj(projection, await this.getProjection())) return

        (await this.resolveGeolocation()).setProjection(projection)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getSpeed () {
        await this.resolveGeolocation()

        return this.getSpeedInternal()
      },
      /**
       * @return {number|undefined}
       * @protected
       */
      getSpeedInternal () {
        return this.$geolocation.getSpeed()
      },
      /**
       * @return {Promise<boolean>}
       */
      async getTracking () {
        await this.resolveGeolocation()

        return this.getTrackingInternal()
      },
      /**
       * @return {boolean}
       * @protected
       */
      getTrackingInternal () {
        return this.$geolocation.getTracking()
      },
      /**
       * @param {boolean} tracking
       * @return {Promise<void>}
       */
      async setTracking (tracking) {
        if (tracking === await this.getTracking()) return

        (await this.resolveGeolocation()).setTracking(tracking)
      },
      /**
       * @return {Promise<Object|undefined>}
       */
      async getTrackingOptions () {
        await this.resolveGeolocation()

        return this.getTrackingOptionsInternal()
      },
      /**
       * @return {Object|undefined}
       * @protected
       */
      getTrackingOptionsInternal () {
        return this.$geolocation.getTrackingOptions()
      },
      /**
       * @param {Promise<Object|undefined>} options
       * @return {Promise<void>}
       */
      async setTrackingOptions (options) {
        if (isEqual(options, await this.getTrackingOptions())) return

        (await this.resolveGeolocation()).setTrackingOptions(options)
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $geolocation: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $mapVm: {
        enumerable: true,
        get: () => this.$services?.mapVm,
      },
      $viewVm: {
        enumerable: true,
        get: () => this.$services?.viewVm,
      },
    })
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    const prefixKey = addPrefix('current')
    const geomChanges = obsFromOlChangeEvent(this.$geolocation, 'accuracyGeometry', true).pipe(
      mergeMap(({ prop }) => fromObs(this.getAccuracyGeometry()).pipe(
        mapObs(geometry => ({
          prop,
          value: this.writeGeometryInDataProj(geometry),
          compareWith: this.currentAccuracyGeometryDataProj,
        })),
      )),
    )
    const projChanges = obsFromOlChangeEvent(this.$geolocation, 'projection', true, evt => ({
      ...evt,
      value: getProj(evt.value).getCode(),
      compareWith: this.currentProjection,
    }))
    const propsChanges = mergeObs(
      geomChanges,
      projChanges,
      obsFromOlChangeEvent(this.$geolocation, [
        'accuracy',
        'altitude',
        'altitudeAccuracy',
        'heading',
        'speed',
        'position',
        'tracking',
        'trackingOptions',
      ], true, evt => ({
        ...evt,
        compareWith: this[prefixKey(evt.prop)],
      })),
    ).pipe(
      skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
    )

    this.subscribeTo(propsChanges, () => {
      ++this.rev
    })
  }
</script>
