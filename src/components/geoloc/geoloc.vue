<script>
  import Geolocation from 'ol/geolocation'
  import { isEqual } from 'lodash/fp'
  import Observable from '../../rx-ext'
  import { consts } from '../../ol-ext'
  import rxSubs from '../../mixins/rx-subs'
  import stubVNode from '../../mixins/stub-vnode'

  const { DATA_PROJECTION } = consts

  const props = {
    tracking: {
      type: Boolean,
      default: true
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
    mixins: [ rxSubs, stubVNode ],
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
      projection: DATA_PROJECTION
    })
    this.geoloc.set('vm', this)

    return this.geoloc
  }

  function subscribeToGeolocation () {
    const positionChanges = Observable.of(this.geoloc.getPosition())
      .merge(
        Observable.fromOlEvent(
          this.geoloc,
          'change:position',
          () => this.geoloc.getPosition()
        )
      )
      .filter(x => x != null)

    const accuracyChanges = Observable.of(this.geoloc.getAccuracy())
      .merge(
        Observable.fromOlEvent(
          this.geoloc,
          'change:accuracy',
          () => this.geoloc.getAccuracy()
        )
      )
      .filter(x => x != null)

    const geolocChanges = Observable.combineLatest(positionChanges, accuracyChanges)
      .throttleTime(300)
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.subscribeTo(geolocChanges, ([ position, accuracy ]) => {
      let changed = false

      if (!isEqual(position, this.currentPosition)) {
        this.currentPosition = position
        changed = true
      }

      if (accuracy !== this.currentAccuracy) {
        this.currentAccuracy = accuracy
        changed = true
      }

      changed && this.$emit('change', { position, accuracy })
    })
  }
</script>
