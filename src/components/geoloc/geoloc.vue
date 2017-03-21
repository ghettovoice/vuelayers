<script>
  import Geolocation from 'ol/geolocation'
  import { consts, coordinateHelper } from 'vl-ol'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/combineLatest'
  import 'rxjs/add/observable/of'
  import 'rxjs/add/operator/throttleTime'
  import 'rxjs/add/operator/distinctUntilChanged'
  import 'rxjs/add/operator/map'
  import 'rxjs/add/operator/merge'
  import 'vl-rx'
  import { isEqual } from 'lodash/fp'
  import rxSubs from 'vl-mixins/rx-subs'
  import vmBind from 'vl-mixins/vm-bind'
  import stubVNode from 'vl-mixins/stub-vnode'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    },
    projection: {
      type: String,
      default: consts.MAP_PROJECTION
    }
  }

  const methods = {
    refresh () {
      this.geoloc.changed()
    },
    subscribeAll () {
      this::subscribeToGeolocation()
    },
    mountGeoloc () {
      this.subscribeAll()
    },
    unmountGeoloc () {
      this.unsubscribeAll()
      this.geoloc.setTracking(false)
    }
  }

  const watch = {
    tracking (value) {
      this.geoloc.setTracking(value)
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [ rxSubs, vmBind, stubVNode ],
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
    },
    mounted () {
      this.$nextTick(this.mountGeoloc)
    },
    destroyed () {
      this.$nextTick(() => {
        this.unmountGeoloc()
        this.geoloc = undefined
      })
    }
  }

  /**
   * @return {Geolocation}
   */
  function createGeolocApi () {
    /**
     * @type {Geolocation}
     * @protected
     */
    this.geoloc = new Geolocation({
      tracking: this.tracking,
      projection: this.projection
    })

    this.bindSelfTo(this.geoloc)

    return this.geoloc
  }

  function subscribeToGeolocation () {
    const geolocChanges = Observable.combineLatest(
      Observable.of(this.geoloc.getPosition())
        .merge(
          Observable.fromOlEvent(
            this.geoloc,
            'change:position',
            () => this.geoloc.getPosition()
          )
        ),
      Observable.of(this.geoloc.getAccuracy())
        .merge(
          Observable.fromOlEvent(
            this.geoloc,
            'change:accuracy',
            () => this.geoloc.getAccuracy()
          )
        )
    ).throttleTime(300)
      .distinctUntilChanged((a, b) => isEqual(a, b))
      .map(([ position, accuracy ]) => ({
        position: coordinateHelper.pointToLonLat(position, this.projection),
        accuracy
      }))

    this.subscribeTo(
      geolocChanges,
      ({ position, accuracy }) => {
        let changed
        if (!isEqual(position, this.currentPosition)) {
          this.currentPosition = position
          changed = true
        }
        if (accuracy !== this.currentAccuracy) {
          this.currentAccuracy = accuracy
          changed = true
        }

        changed && this.$emit('change', { position, accuracy })
      }
    )
  }
</script>

<style>/* stub style  */</style>
