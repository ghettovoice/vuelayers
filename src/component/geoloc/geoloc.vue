<template>
  <i :class="[$options.name]" style="display: none !important;">
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

  const props = {
    tracking: {
      type: Boolean,
      default: true,
    },
    trackingOptions: Object,
    /**
     * @type {string}
     */
    projection: String,
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
      if (this.position && this.resolvedDataProjection) {
        return this.pointToViewProj(this.position)
      }
    },
  }

  const methods = {
    /**
     * @return {Geolocation}
     * @private
     */
    createOlObject () {
      return new Geolocation({
        tracking: this.tracking,
        trackingOptions: this.trackingOptions,
        projection: this.resolvedDataProjection,
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
    resolvedDataProjection (value) {
      if (this.$geolocation) {
        this.$geolocation.setProjection(value)
      }
    },
  }

  export default {
    name: 'vl-geoloc',
    mixins: [olCmp, useMapCmp, projTransforms],
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
         * @type {Geolocation|undefined}
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
         * @type {View|undefined}
         */
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    hasGeolocation(this)

    const ft = 100
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
        () => this.position,
      ),
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
