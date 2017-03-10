<script>
  import ol, { consts as olConsts } from 'vl-ol'
  import Observable from 'vl-rx'
  import { errordbg } from 'vl-utils/debug'
  import { isEqual } from 'vl-utils/func'
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
      default: olConsts.MAP_PROJECTION
    }
  }

  const methods = {
    refresh () {
      this.geoloc && this.geoloc.changed()
    },
    subscribeAll () {
      this::subscribeToGeolocation()
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
      this.subscribeAll()
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

    this.bindSelfTo(this.geoloc)

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
      },
      err => errordbg(err.stack)
    )
  }
</script>

<style>/* stub style  */</style>
