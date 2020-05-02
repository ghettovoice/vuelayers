<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot
      :accuracy="accuracy"
      :altitude="altitude"
      :altitude-accuracy="altitudeAccuracy"
      :heading="heading"
      :position="position"
      :speed="speed" />
  </i>
</template>

<script>
  import { Geolocation } from 'ol'
  import { olCmp, projTransforms } from '../../mixin'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import { isEqual } from '../../util/minilo'

  export default {
    name: 'VlGeoloc',
    mixins: [
      projTransforms,
      olCmp,
      // waitForMap,
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
      projection: String,
    },
    computed: {
      accuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getAccuracy()
      },
      altitude () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getAltitude()
      },
      altitudeAccuracy () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getAltitudeAccuracy()
      },
      heading () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getHeading()
      },
      speed () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getSpeed()
      },
      position () {
        if (!(this.rev && this.$geolocation)) return

        return this.$geolocation.getPosition()
      },
      positionViewProj () {
        if (!(this.position && this.viewProjection)) return

        return this.pointToViewProj(this.position)
      },
    },
    watch: {
      id (value) {
        this.setId(value)
      },
      tracking (value) {
        this.setTracking(value)
      },
      tracingOptions (value) {
        this.setTrackingOptions(value)
      },
      resolvedDataProjection (value) {
        this.setProjection(value)
      },
    },
    created () {
      this::defineServices()
    },
    methods: {
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

        geoloc.set('id', this.id)

        return geoloc
      },
      /**
       * @return {Promise<number|string>}
       */
      async getId () {
        return (await this.resolveGeolocation()).get('id')
      },
      /**
       * @param {string|number} id
       * @return {Promise<void>}
       */
      async setId (id) {
        const geoloc = await this.resolveGeolocation()

        if (id === geoloc.get('id')) return

        geoloc.set('id', id)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAccuracy () {
        return (await this.resolveGeolocation()).getAccuracy()
      },
      /**
       * @return {Promise<module:/ol/geom/Geometry~Geometry|undefined>}
       */
      async getAccuracyGeometry () {
        return (await this.resolveGeolocation()).getAccuracyGeometry()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitude () {
        return (await this.resolveGeolocation()).getAltitude()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getAltitudeAccuracy () {
        return (await this.resolveGeolocation()).getAltitudeAccuracy()
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getHeading () {
        return (await this.resolveGeolocation()).getHeading()
      },
      /**
       * @return {Promise<number[]|undefined>}
       */
      async getPosition () {
        return (await this.resolveGeolocation()).getPosition()
      },
      /**
       * @return {Promise<module:ol/proj~ProjectionLike|undefined>}
       */
      async getProjection () {
        return (await this.resolveGeolocation()).getProjection()
      },
      /**
       * @param {module:ol/proj~ProjectionLike} projection
       * @return {Promise<void>}
       */
      async setProjection (projection) {
        const geoloc = await this.resolveGeolocation()

        // if (isEqProj(projection, geoloc.getProjection())) return

        geoloc.setProjection(projection)
      },
      /**
       * @return {Promise<number|undefined>}
       */
      async getSpeed () {
        return (await this.resolveGeolocation()).getSpeed()
      },
      /**
       * @return {Promise<boolean|undefined>}
       */
      async getTracking () {
        return (await this.resolveGeolocation()).getTracking()
      },
      /**
       * @param {Promise<number|undefined>} tracking
       * @return {Promise<void>}
       */
      async setTracking (tracking) {
        const geoloc = await this.resolveGeolocation()

        if (tracking === geoloc.getTracking()) return

        geoloc.setTracking(tracking)
      },
      /**
       * @return {Promise<Object|undefined>}
       */
      async getTrackingOptions () {
        return (await this.resolveGeolocation()).getTrackingOptions()
      },
      /**
       * @param {Promise<Object|undefined>} options
       * @return {Promise<void>}
       */
      async setTrackingOptions (options) {
        const geoloc = await this.resolveGeolocation()

        if (isEqual(options, geoloc.getTrackingOptions())) return

        geoloc.setTrackingOptions(options)
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
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      /**
       * @type {ol/Geolocation~Geolocation|undefined}
       */
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
    const changes = obsFromOlChangeEvent(this.$geolocation, [
      'accuracy',
      'altitude',
      'altitudeaccuracy',
      'heading',
      'speed',
      'position',
    ], true)

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev

      this.$nextTick(() => {
        this.$emit(`update:${prop}`, value)
      })
    })
  }
</script>
