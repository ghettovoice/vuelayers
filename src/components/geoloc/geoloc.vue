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
      return this.geoloc && this.geoloc.getAccuracy()
    },
    altitude () {
      return this.geoloc && this.geoloc.getAltitude()
    },
    altitudeAccuracy () {
      return this.geoloc && this.geoloc.getAltitudeAccuracy()
    },
    heading () {
      return this.geoloc && this.geoloc.getHeading()
    },
    position () {
      return this.geoloc && this.geoloc.getPosition()
    },
    speed () {
      return this.geoloc && this.geoloc.getSpeed()
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
        geoloc: {
          enumerable: true,
          get: this.getGeoloc
        }
      })
    },
    /**
     * @returns {ol.Geolocation|undefined}
     */
    getGeoloc () {
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
      assert.hasGeoloc(this)

      this.unsubscribeAll()
      this.geoloc.setTracking(false)
    },
    /**
     * @return {void}
     */
    refresh () {
      assert.hasGeoloc(this)
      this.geoloc.changed()
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
      this.geoloc && this.geoloc.setTracking(value)
    },
    tracingOptions (value) {
      this.geoloc && this.geoloc.setTrackingOptions(value)
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
    assert.hasGeoloc(this)

    const ft = 100
    const getObservable = field => {
      return Observable.fromOlEvent(this.geoloc, `change:${field}`, () => this[field])
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
