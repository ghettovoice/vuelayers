<script>
  import Geolocation from 'ol/geolocation'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/from'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import 'rxjs/add/operator/mergeMap'
  import '../../rx-ext'
  import { EPSG_4326 } from '../../ol-ext'
  import cmp from '../ol-virt-cmp'
  import * as assert from '../../utils/assert'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    },
    trackingOptions: Object
  }

  const computed = {
    accuracy () {
      return this.geolocation && this.geolocation.getAccuracy()
    },
    altitude () {
      return this.geolocation && this.geolocation.getAltitude()
    },
    altitudeAccuracy () {
      return this.geolocation && this.geolocation.getAltitudeAccuracy()
    },
    heading () {
      return this.geolocation && this.geolocation.getHeading()
    },
    position () {
      return this.geolocation && this.geolocation.getPosition()
    },
    speed () {
      return this.geolocation && this.geolocation.getSpeed()
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
     * @return {void}
     * @private
     */
    defineAccessors () {
      Object.defineProperties(this, {
        geolocation: {
          enumerable: true,
          get: this.getGeolocation
        }
      })
    },
    /**
     * @returns {ol.Geolocation|undefined}
     */
    getGeolocation () {
      return this.olObject
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
      this.geolocation.setTracking(false)
    },
    /**
     * @return {void}
     */
    refresh () {
      assert.hasGeolocation(this)
      this.geolocation.changed()
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
      if (this.geolocation && value !== this.geolocation.getTracking()) {
        this.geolocation.setTracking(value)
      }
    },
    tracingOptions (value) {
      this.geolocation && this.geolocation.setTrackingOptions(value)
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
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    assert.hasGeolocation(this)

    const ft = 100
    const getObservable = field => {
      return Observable.fromOlEvent(this.geolocation, `change:${field}`, () => this[field])
        .throttleTime(ft)
        .distinctUntilChanged(isEqual)
        .map(value => ({
          name: `update:${field}`,
          value
        }))
    }
    const events = Observable.from([
      'accuracy',
      'altitude',
      'altitudeaccuracy',
      'heading',
      'position',
      'speed'
    ]).mergeMap(getObservable)

    this.subscribeTo(events, ({ name, value }) => this.$emit(name, value))
  }
</script>
