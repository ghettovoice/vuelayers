<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :accuracy="accuracy" :altitude="altitude" :altitude-accuracy="altitudeAccuracy"
          :heading="heading" :position="position" :speed="speed"></slot>
  </i>
</template>

<script>
  import Geolocation from 'ol/geolocation'
  import { EPSG_4326, olCmp, useMapCmp, assert, observableFromOlChangeEvent } from '../../core'

  const props = {
    tracking: {
      type: Boolean,
      default: true,
    },
    trackingOptions: Object,
    projection: {
      type: String,
      default: EPSG_4326,
    },
    // todo add autoCenter, bindToPosition
  }

  const computed = {
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
    position () {
      if (this.rev && this.$geolocation) {
        return this.$geolocation.getPosition()
      }
    },
    speed () {
      if (this.rev && this.$geolocation) {
        return this.$geolocation.getSpeed()
      }
    },
  }

  const methods = {
    /**
     * @return {ol.Geolocation}
     * @private
     */
    createOlObject () {
      return new Geolocation({
        tracking: this.tracking,
        trackingOptions: this.trackingOptions,
        projection: this.projection,
      })
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
      assert.hasGeolocation(this)

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
  }

  const watch = {
    /**
     * @param {boolean} value
     */
    tracking (value) {
      if (this.$geolocation && value !== this.$geolocation.getTracking()) {
        this.$geolocation.setTracking(value)
      }
    },
    tracingOptions (value) {
      this.$geolocation && this.$geolocation.setTrackingOptions(value)
    },
  }

  export default {
    name: 'vl-geoloc',
    mixins: [olCmp, useMapCmp],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      },
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.Geolocation|undefined}
         */
        $geolocation: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    assert.hasGeolocation(this)

    const ft = 100
    const changes = observableFromOlChangeEvent(
      this.$geolocation,
      [
        'accuracy',
        'altitude',
        'altitudeaccuracy',
        'heading',
        'position',
        'speed',
      ],
      true,
      ft
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
