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
  import stubVNode from 'vl-mixins/stub-vnode'
  import { consts as olConsts } from 'vl-ol'

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
    mixins: [ rxSubs, stubVNode ],
    inject: [ 'serviceLayer' ],
    props,
    watch,
    methods,
    stubVNode: {
      empty () {
        return this.$options.name
      }
    },
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
      this.$nextTick(() => {
        this.geoloc.setTracking(false)
        this.geoloc = undefined
      })
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

    return this.geoloc
  }

  function subscribeToGeolocation () {
    const geolocChanges = Observable.combineLatest(
      Observable.fromOlEvent(this.geoloc, 'change:position'),
      Observable.fromOlEvent(this.geoloc, 'change:accuracy')
    ).throttleTime(1000)
      .distinctUntilChanged((a, b) => isEqual(a, b))
      .map(() => {
        const position = ol.proj.toLonLat(this.geoloc.getPosition(), this.projection)
        const accuracy = this.geoloc.getAccuracy()

        return { position, accuracy }
      })

    this.rxSubs.geoloc = geolocChanges.subscribe(
      ({ position, accuracy }) => {
        this.currentPosition = position
        this.currentAccuracy = accuracy
        this.$emit('change', { position, accuracy })
      },
      err => errordbg(err.stack)
    )
  }
</script>

<style>
  /* stub style  */
</style>
