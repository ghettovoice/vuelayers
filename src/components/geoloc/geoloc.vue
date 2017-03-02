<script>
  import ol from 'openlayers'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vuelayers/src/rx'
  import { errordbg } from 'vuelayers/src/utils/debug'
  import exposeInject from 'vuelayers/src/mixins/expose-inject'
  import rxSubs from 'vuelayers/src/mixins/rx-subs'
  import positionMarker from './position-marker.svg'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    }
  }

  const watch = {
    tracking (value) {
      this.geoloc.setTracking(value)
    },
    refresh () {
      this.geoloc.changed()
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [ exposeInject, rxSubs ],
    inject: [ 'map', 'serviceOverlay' ],
    props,
    watch,
    render: h => h(),
    data () {
      return {
        currentPosition: undefined,
        currentAccuracy: undefined
      }
    },
    created () {
      this::createGeolocApi()

      this::subscribeToGeolocation()
    },
    beforeDestroy () {
      this.geoloc.setTracking(false)
      this.serviceOverlay.getSource().removeFeature(this.positionFeature)
    },
    destroyed () {
      this.geoloc = this.positionFeature = undefined
    }
  }

  /**
   * @return {ol.Geolocation}
   */
  function createGeolocApi () {
    /**
     * @type {ol.Geolocation}
     * @protected
     */
    this.geoloc = new ol.Geolocation({
      tracking: this.tracking,
      projection: this.projection
    })

    this.geoloc.vm = this
    /**
     * @type {ol.Feature}
     * @protected
     */
    this.positionFeature = new ol.Feature({
      internal: true
    })
    this.positionFeature.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        src: positionMarker,
        scale: 0.85,
        anchor: [ 0.5, 1 ]
      })
    }))
    this.serviceOverlay.getSource().addFeature(this.positionFeature)

    return this.geoloc
  }

  function subscribeToGeolocation () {
    const geolocChanges = Observable.fromOlEvent(this.geoloc, 'change')
      .throttleTime(100)
      .map(() => {
        const position = ol.proj.toLonLat(this.geoloc.getPosition(), this.projection)
        const accuracy = this.geoloc.getAccuracy()

        return [ position, accuracy ]
      })
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.rxSubs.geoloc = geolocChanges.subscribe(
      ([ position, accuracy ]) => {
        this.currentPosition = position
        this.currentAccuracy = accuracy

        this.$emit('change', { position, accuracy })
      },
      errordbg
    )
  }
</script>

<style>
  /* stub style  */
</style>
