<template>
  <i :class="$options.name" style="display: none !important;">
    <slot :accuracy="accuracy" :altitude="altitude" :altitude-accuracy="altitudeAccuracy"
          :heading="heading" :position="position" :speed="speed"></slot>
  </i>
</template>

<script>
  import Geolocation from 'ol/geolocation'
  import { Observable } from 'rxjs/Observable'
  import '../../rx-ext'
  import { EPSG_4326 } from '../../ol-ext'
  import cmp from '../ol-cmp'
  import * as assert from '../../utils/assert'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    },
    trackingOptions: Object
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
    }
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
        projection: EPSG_4326
      })
    },
    /**
     * @returns {ol.Geolocation|undefined}
     */
    getGeolocation () {
      return this.$olObject
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
    }
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
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [cmp],
    props,
    computed,
    methods,
    watch,
    stubVNode: {
      empty () {
        return this.$options.name
      }
    },
    data () {
      return {
        rev: 1
      }
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.Geolocation|undefined}
         */
        $geolocation: {
          enumerable: true,
          get: this.getGeolocation
        }
      })
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    assert.hasGeolocation(this)

    const ft = 100
    const changes = Observable.fromOlChangeEvent(
      this.$geolocation,
      [
        'accuracy',
        'altitude',
        'altitudeaccuracy',
        'heading',
        'position',
        'speed'
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
