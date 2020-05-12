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
  import { mergeMap, skipWhile, map as mapObs } from 'rxjs/operators'
  import { FRAME_TIME, olCmp, OlObjectEvent, projTransforms } from '../../mixin'
  import { getMapDataProjection, writeGeoJsonGeometry } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent, fromVueEvent as obsFromVueEvent } from '../../rx-ext'
  import { assert } from '../../util/assert'
  import { addPrefix, clonePlainObject, coalesce, hasProp, isEqual } from '../../util/minilo'
  import waitFor from '../../util/wait-for'

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
        validator: value => getProj(value) != null,
      },
    },
    data () {
      return {
        dataProjection: null,
      }
    },
    computed: {
      currentTracking () {
        if (this.rev && this.$geolocation) {
          return this.getTrackingSync()
        }

        return this.tracking
      },
      currentTrackingOptions () {
        if (this.rev && this.$geolocation) {
          return this.getTrackingOptionsSync()
        }

        return this.trackingOptions
      },
      currentProjection () {
        if (this.rev && this.$geolocation) {
          return getProj(this.getProjectionSync()).getCode()
        }

        return this.projection
      },
      resolvedDataProjection () {
        return coalesce(
          this.currentProjection, // may or may not be present
          this.dataProjection, // may or may not be present
          this.$mapVm?.resolvedDataProjection,
          this.$map && getMapDataProjection(this.$map),
          this.$options?.dataProjection,
          this.viewProjection,
        )
      },
      currentAccuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAccuracySync()
      },
      currentAccuracyGeometryDataProj () {
        if (!(this.rev && this.$geolocation)) return

        return writeGeoJsonGeometry(
          this.getAccuracyGeometrySync(),
          this.currentProjection || this.resolvedDataProjection,
          this.resolvedDataProjection,
        )
      },
      currentAccuracyGeometryViewProj () {
        if (!(this.rev && this.$geolocation)) return

        return writeGeoJsonGeometry(
          this.getAccuracyGeometrySync(),
          this.currentProjection || this.resolvedDataProjection,
          this.viewProjection,
        )
      },
      currentAltitude () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAltitudeSync()
      },
      currentAltitudeAccuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.getAltitudeAccuracySync()
      },
      currentHeading () {
        if (!(this.rev && this.$geolocation)) return

        return this.getHeadingSync()
      },
      currentSpeed () {
        if (!(this.rev && this.$geolocation)) return

        return this.getSpeedSync()
      },
      currentPositionDataProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.getPositionSync()
      },
      currentPositionViewProj () {
        if (!(this.rev && this.$geolocation)) return

        return this.pointToViewProj(this.getPositionSync())
      },
    },
    watch: {
      async tracking (value) {
        await this.setTracking(value)
      },
      currentTracking: debounce(function (value) {
        if (value === this.tracking) return

        this.$emit('update:tracking', value)
      }, FRAME_TIME),
      async tracingOptions (value) {
        await this.setTrackingOptions(value)
      },
      currentTrackingOptions: {
        deep: true,
        handler: debounce(function (value) {
          if (isEqual(value, this.trackingOptions)) return

          value && (value = clonePlainObject(value))
          this.$emit('update:tracingOptions', value)
        }, FRAME_TIME),
      },
      async resolvedDataProjection (value) {
        await this.setProjection(value)
      },
      currentProjection: debounce(function (value) {
        if (value === this.projection) return

        this.$emit('update:projection', value)
      }, FRAME_TIME),
      currentAccuracy: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:accuracy', value)
      }, FRAME_TIME),
      currentAccuracyGeometryDataProj: debounce(function (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:accuracyGeometry', value)
      }, FRAME_TIME),
      currentAltitude: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:altitude', value)
      }, FRAME_TIME),
      currentAltitudeAccuracy: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:altitudeAccuracy', value)
      }, FRAME_TIME),
      currentHeading: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:heading', value)
      }, FRAME_TIME),
      currentSpeed: debounce(function (value, prev) {
        if (value === prev) return

        this.$emit('update:speed', value)
      }, FRAME_TIME),
      currentPositionDataProj: debounce(function (value, prev) {
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
      getIdSync () {
        return this.$geolocation.get('id')
      },
      /**
       * @param {string|number} id
       * @return {void}
       */
      setIdSync (id) {
        assert(id != null && id !== '', 'Invalid geolocation id')

        if (id === this.getIdSync()) return

        this.$geolocation.set('id', id)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAccuracy () {
        await this.resolveGeolocation()

        return this.getAccuracySync()
      },
      getAccuracySync () {
        return this.$geolocation.getAccuracy()
      },
      /**
       * @return {Promise<module:/ol/geom/Geometry~Geometry|undefined>}
       */
      async getAccuracyGeometry () {
        await this.resolveGeolocation()

        return this.getAccuracyGeometrySync()
      },
      getAccuracyGeometrySync () {
        return this.$geolocation.getAccuracyGeometry()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitude () {
        await this.resolveGeolocation()

        return this.getAltitudeSync()
      },
      getAltitudeSync () {
        return this.$geolocation.getAltitude()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitudeAccuracy () {
        await this.resolveGeolocation()

        return this.getAltitudeAccuracySync()
      },
      getAltitudeAccuracySync () {
        return this.$geolocation.getAltitudeAccuracy()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getHeading () {
        await this.resolveGeolocation()

        return this.getHeadingSync()
      },
      getHeadingSync () {
        return this.$geolocation.getHeading()
      },
      /**
       * @return {Promise<number[]|undefined>}
       */
      async getPosition () {
        await this.resolveGeolocation()

        return this.getPositionSync()
      },
      getPositionSync () {
        return this.$geolocation.getPosition()
      },
      /**
       * @return {Promise<module:ol/proj~ProjectionLike|undefined>}
       */
      async getProjection () {
        await this.resolveGeolocation()

        return this.getProjectionSync()
      },
      getProjectionSync () {
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

        return this.getSpeedSync()
      },
      getSpeedSync () {
        return this.$geolocation.getSpeed()
      },
      /**
       * @return {Promise<boolean>}
       */
      async getTracking () {
        await this.resolveGeolocation()

        return this.getTrackingSync()
      },
      getTrackingSync () {
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

        return this.getTrackingOptionsSync()
      },
      getTrackingOptionsSync () {
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
        'altitudeaccuracy',
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
