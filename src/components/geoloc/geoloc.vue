<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :accuracy="accuracy"
      :accuracy-geometry="accuracyGeometryDataProj"
      :altitude="altitude"
      :altitude-accuracy="altitudeAccuracy"
      :heading="heading"
      :position="positionDataProj"
      :speed="speed" />
  </i>
</template>

<script>
  import { Geolocation } from 'ol'
  import { get as getProj } from 'ol/proj'
  import { merge as mergeObs } from 'rxjs'
  import { map as mapObs } from 'rxjs/operators'
  import { olCmp, projTransforms, waitForMap } from '../../mixins'
  import { EPSG_3857 } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import { addPrefix, and, assert, clonePlainObject, coalesce, isEqual, isString } from '../../utils'

  const validateProjection = /*#__PURE__*/and(isString, value => getProj(value) != null)

  export default {
    name: 'VlGeoloc',
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
      tracking: {
        type: Boolean,
        default: true,
      },
      trackingOptions: Object,
      projection: {
        type: String,
        validator: validateProjection,
      },
    },
    data () {
      return {
        viewProjection: EPSG_3857,
        dataProjection: EPSG_3857,
        currentTracking: this.tracking,
        currentTrackingOptions: this.trackingOptions && clonePlainObject(this.trackingOptions),
        currentProjection: this.projection,
      }
    },
    computed: {
      resolvedDataProjection () {
        return coalesce(
          this.currentProjection,
          this.$options?.dataProjection,
          this.dataProjection,
          this.resolvedViewProjection,
        )
      },
      accuracy () {
        return this.rev ? this.getAccuracy() : undefined
      },
      accuracyGeometryDataProj () {
        return this.rev ? this.writeGeometryInDataProj(this.getAccuracyGeometry()) : undefined
      },
      accuracyGeometryViewProj () {
        return this.rev ? this.writeGeometryInViewProj(this.getAccuracyGeometry()) : undefined
      },
      altitude () {
        return this.rev ? this.getAltitude() : undefined
      },
      altitudeAccuracy () {
        return this.rev ? this.getAltitudeAccuracy() : undefined
      },
      heading () {
        return this.rev ? this.getHeading() : undefined
      },
      speed () {
        return this.rev ? this.getSpeed() : undefined
      },
      positionDataProj () {
        return this.rev ? this.getPosition() : undefined
      },
      positionViewProj () {
        return this.rev ? this.pointToViewProj(this.getPosition()) : undefined
      },
    },
    watch: {
      rev () {
        if (!this.$geolocation) return

        if (this.currentTracking !== this.$geolocation.getTracking()) {
          this.currentTracking = this.$geolocation.getTracking()
        }
        if (!isEqual(this.currentTrackingOptions, this.$geolocation.getTrackingOptions())) {
          this.currentTrackingOptions = this.$geolocation.getTrackingOptions()
        }
        if (this.currentProjection !== this.$geolocation.getProjection().getCode()) {
          this.currentProjection = this.$geolocation.getProjection().getCode()
        }
      },
      tracking (value) {
        this.setTracking(value)
      },
      currentTracking (value) {
        if (value === this.tracking) return

        this.$emit('update:tracking', value)
      },
      tracingOptions: {
        deep: true,
        handler (value) {
          this.setTrackingOptions(value)
        },
      },
      currentTrackingOptions: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.trackingOptions)) return

          this.$emit('update:tracingOptions', value && clonePlainObject(value))
        },
      },
      projection (value) {
        this.setProjection(value)
      },
      currentProjection (value) {
        if (value === this.projection) return

        this.$emit('update:projection', value)
      },
      accuracy (value, prev) {
        if (value === prev) return

        this.$emit('update:accuracy', value)
      },
      accuracyGeometryDataProj (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:accuracyGeometry', value)
      },
      currentAltitude (value, prev) {
        if (value === prev) return

        this.$emit('update:altitude', value)
      },
      altitudeAccuracy (value, prev) {
        if (value === prev) return

        this.$emit('update:altitudeAccuracy', value)
      },
      heading (value, prev) {
        if (value === prev) return

        this.$emit('update:heading', value)
      },
      speed (value, prev) {
        if (value === prev) return

        this.$emit('update:speed', value)
      },
      positionDataProj (value, prev) {
        if (isEqual(value, prev)) return

        this.$emit('update:position', value)
      },
    },
    created () {
      this::defineServices()
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
       * @return {module:ol/Geolocation~Geolocation}
       * @private
       */
      createOlObject () {
        const geoloc = new Geolocation({
          tracking: this.currentTracking,
          trackingOptions: this.currentTrackingOptions,
          projection: this.resolvedDataProjection,
        })
        geoloc.set('id', this.currentId)

        return geoloc
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      mount () {
        this.setTracking(this.tracking)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      unmount () {
        this.setTracking(false)

        return this::olCmp.methods.unmount()
      },
      /**
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
        if (id === this.getIdInternal()) return

        this.$geolocation.set('id', id)
      },
      /**
       * @return {number|undefined}
       */
      getAccuracy () {
        return this.$geolocation?.getAccuracy()
      },
      /**
       * @return {module:/ol/geom/Geometry~Geometry|undefined}
       */
      getAccuracyGeometry () {
        return this.$geolocation?.getAccuracyGeometry()
      },
      /**
       * @return {number|undefined}
       */
      getAltitude () {
        return this.$geolocation?.getAltitude()
      },
      /**
       * @return {number|undefined}
       */
      getAltitudeAccuracy () {
        return this.$geolocation?.getAltitudeAccuracy()
      },
      /**
       * @return {number|undefined}
       */
      getHeading () {
        return this.$geolocation?.getHeading()
      },
      /**
       * @return {number[]|undefined}
       */
      getPosition () {
        return this.$geolocation?.getPosition()
      },
      /**
       * @return {module:ol/proj~ProjectionLike|undefined}
       */
      getProjection () {
        return coalesce(this.$geolocation?.getProjection(), this.currentProjection)
      },
      /**
       * @param {module:ol/proj~ProjectionLike} projection
       */
      setProjection (projection) {
        assert(validateProjection(projection), 'Invalid projection')
        projection = getProj(projection)

        if (projection.getCode() !== this.currentProjection) {
          this.currentProjection = projection.getCode()
        }
        if (this.$geolocation && projection !== this.$geolocation.getProjection()) {
          this.$geolocation.setProjection(projection)
        }
      },
      /**
       * @return {number|undefined}
       */
      getSpeed () {
        return this.$geolocation?.getSpeed()
      },
      /**
       * @return {boolean}
       */
      getTracking () {
        return coalesce(this.$geolocation?.getTracking(), this.currentTracking)
      },
      /**
       * @param {boolean} tracking
       */
      setTracking (tracking) {
        if (tracking !== this.currentTracking) {
          this.currentTracking = tracking
        }
        if (this.$geolocation && tracking !== this.$geolocation.getTracking()) {
          this.$geolocation.setTracking(tracking)
        }
      },
      /**
       * @return {Object|undefined}
       */
      getTrackingOptions () {
        return coalesce(this.$geolocation?.getTrackingOptions(), this.currentTrackingOptions)
      },
      /**
       * @param {Promise<Object|undefined>} options
       */
      setTrackingOptions (options) {
        if (!isEqual(options, this.currentTrackingOptions)) {
          this.currentTrackingOptions = options
        }
        if (this.$geolocation && !isEqual(options, this.$geolocation.getTrackingOptions())) {
          this.$geolocation.setTrackingOptions(options)
        }
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
    const setterKey = addPrefix('set')
    const setPropsChanges = mergeObs(
      obsFromOlChangeEvent(this.$geolocation, 'projection', true, evt => ({
        ...evt,
        value: getProj(evt.value).getCode(),
      })),
      obsFromOlChangeEvent(this.$geolocation, [
        'tracking',
        'trackingOptions',
      ], true),
    ).pipe(
      mapObs(evt => ({
        ...evt,
        setter: val => {
          this[setterKey(evt.prop)](val)
          this.scheduleRefresh()
        },
      })),
    )
    this.subscribeTo(setPropsChanges, ({ setter, value }) => setter(value))

    const otherChanged = obsFromOlChangeEvent(this.$geolocation, [
      'accuracy',
      'accuracyGeometry',
      'altitude',
      'altitudeAccuracy',
      'heading',
      'speed',
      'position',
    ], true)
    this.subscribeTo(otherChanged, ::this.scheduleRefresh)
  }
</script>
