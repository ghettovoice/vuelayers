<template>
  <i :class="[$options.name]" style="display: none !important;">
    <slot :accuracy="accuracy" :altitude="altitude" :altitude-accuracy="altitudeAccuracy"
          :heading="heading" :position="position" :speed="speed">
    </slot>
  </i>
</template>

<script>
  /**
   * @module geoloc/geoloc
   */
  import Geolocation from 'ol/geolocation'
  import { Observable } from 'rxjs'
  import { merge } from 'rxjs/observable'
  import olCmp from '../../mixin/ol-cmp'
  import projTransforms from '../../mixin/proj-transforms'
  import useMapCmp from '../../mixin/use-map-cmp'
  import { EPSG_3857 } from '../../ol-ext/consts'
  import observableFromOlChangeEvent from '../../rx-ext/from-ol-change-event'
  import { hasGeolocation } from '../../util/assert'

  const props = {
    tracking: {
      type: Boolean,
      default: true,
    },
    trackingOptions: Object,
    projection: {
      type: String,
      default: EPSG_3857,
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
    viewProjPosition () {
      if (this.position) {
        return this.pointToViewProj(this.position)
      }
    },
    dataProjPosition () {
      if (this.position) {
        return this.pointToDataProj(this.position)
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
    hasGeolocation(this)

    const ft = 100
    const changes = Observable::merge(
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
        () => this.dataProjPosition,
      )
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
