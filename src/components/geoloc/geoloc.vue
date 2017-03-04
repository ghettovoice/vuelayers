<script>
  import ol from 'openlayers'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/map'
  import 'vl-rx'
  import { errordbg } from 'vl-utils/debug'
  import rxSubs from 'vl-mixins/rx-subs'
  import { consts as olConsts } from 'vl-ol'
//  import positionMarker from './position-marker.svg'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    },
    projection: {
      type: String,
      default: olConsts.MAP_PROJECTION
    }
  }

  const methods = {
    refresh () {
      this.geoloc.changed()
    }
  }

  const watch = {
    tracking (value) {
      this.geoloc.setTracking(value)
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [ rxSubs ],
    inject: [ 'serviceLayer' ],
    props,
    watch,
    methods,
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
    destroyed () {
      this.geoloc.setTracking(false)
//      this.serviceLayer() && this.serviceLayer().getSource().removeFeature(this.positionFeature)
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

    this.geoloc.$vm = this
    /**
     * @type {ol.Feature}
     * @protected
     */
//    this.positionFeature = new ol.Feature({
//      internal: true
//    })
//    this.positionFeature.setStyle(new ol.style.Style({
//      image: new ol.style.Icon({
//        src: positionMarker,
//        scale: 0.85,
//        anchor: [ 0.5, 1 ]
//      })
//    }))
//    this.serviceLayer() && this.serviceLayer().getSource().addFeature(this.positionFeature)

    return this.geoloc
  }

  function subscribeToGeolocation () {
    const geolocChanges = Observable.fromOlEvent(this.geoloc, 'change')
      .throttleTime(100)
      .map(() => {
        const position = ol.proj.toLonLat(this.geoloc.getPosition(), this.projection)
        const accuracy = this.geoloc.getAccuracy()

        return { position, accuracy }
      })
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.rxSubs.geoloc = geolocChanges.subscribe(
      ({ position, accuracy }) => {
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
