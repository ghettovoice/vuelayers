<template>
  <i :id="vmId" :class="cmpName" style="display: none !important;">
    <slot :accuracy="accuracy" :altitude="altitude" :altitude-accuracy="altitudeAccuracy"
          :heading="heading" :position="position" :speed="speed">
    </slot>
  </i>
</template>

<script>
  import Geolocation from 'ol/Geolocation'
  import { merge } from 'rxjs/observable'
  import { olCmp, useMapCmp, projTransforms } from '../../mixin'
  import { observableFromOlChangeEvent } from '../../rx-ext'
  import { hasGeolocation } from '../../util/assert'
  import { isEqual } from '../../util/minilo'

  export default {
    name: 'vl-geoloc',
    mixins: [olCmp, useMapCmp, projTransforms],
    props: {
      tracking: {
        type: Boolean,
        default: true,
      },
      trackingOptions: Object,
      /**
       * @type {string}
       */
      projection: String,
    },
    computed: {
      accuracy () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getAccuracy()
        }
      },
      altitude () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getAltitude()
        }
      },
      altitudeAccuracy () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getAltitudeAccuracy()
        }
      },
      heading () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getHeading()
        }
      },
      speed () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getSpeed()
        }
      },
      position () {
        if (this.rev && this.$geolocation) {
          return this.$geolocation.getPosition()
        }
      },
      positionViewProj () {
        if (this.position && this.viewProjection) {
          return this.pointToViewProj(this.position)
        }
      },
    },
    methods: {
      /**
       * @return {ol/Geolocation~Geolocation}
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
       * @return {void}
       * @private
       */
      mount () {
        this.subscribeAll()
      },
      /**
       * @return {void}
       * @private
       */
      unmount () {
        hasGeolocation(this)

        this.unsubscribeAll()
        this.$geolocation.setTracking(false)
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::subscribeToGeolocation()
      },
    },
    watch: {
      id (value) {
        if (!this.$geolocation || value === this.geolocation.get('id')) {
          return
        }

        this.$geolocation.set('id', value)
      },
      /**
       * @param {boolean} value
       */
      tracking (value) {
        if (!this.$geolocation && value === this.$geolocation.getTracking()) {
          return
        }

        this.$geolocation.setTracking(value)
      },
      tracingOptions (value, prevValue) {
        if (isEqual(value, prevValue) || !this.$geolocation) return

        this.$geolocation.setTrackingOptions(value)
      },
      resolvedDataProjection (value) {
        if (!this.$geolocation) return

        this.$geolocation.setProjection(value)
      },
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
       * @type {ol/Geolocation~Geolocation|undefined}
       */
      $geolocation: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map,
      },
      /**
       * Reference to `ol.View` instance.
       * @type {module:ol/View~View|undefined}
       */
      $view: {
        enumerable: true,
        get: () => this.$services && this.$services.view,
      },
    })
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    hasGeolocation(this)

    const ft = 1000 / 60
    const changes = merge(
      observableFromOlChangeEvent(
        this.$geolocation,
        [
          'accuracy',
          'altitude',
          'altitudeaccuracy',
          'heading',
          'speed',
        ],
        true,
        ft,
      ),
      observableFromOlChangeEvent(
        this.$geolocation,
        'position',
        true,
        ft,
      ),
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev

      this.$nextTick(() => {
        this.$emit(`update:${prop}`, value)
      })
    })
  }
</script>
