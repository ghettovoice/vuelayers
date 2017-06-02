<script>
  import Geolocation from 'ol/geolocation'
  import { isEqual } from 'lodash/fp'
  import { VM_PROP } from '../../consts'
  import Observable from '../../rx-ext'
  import { consts } from '../../ol-ext'
  import rxSubs from '../rx-subs'
  import stubVNode from '../stub-vnode'
  import { assertHasGeoloc } from '../../utils/assert'

  const { DATA_PROJECTION } = consts

  const props = {
    tracking: {
      type: Boolean,
      default: true
    }
  }

  const methods = {
    /**
     * @returns {ol.Geolocation|undefined}
     */
    getGeoloc () {
      return this._geoloc
    },
    /**
     * @return {void}
     */
    refresh () {
      assertHasGeoloc(this)
      this.geoloc.changed()
    },
    // protected & private
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
      assertHasGeoloc(this)
      this.geoloc.setTracking(value)
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [rxSubs, stubVNode],
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
      this::initialize()
    },
    mounted () {
      this::mount()
    },
    destroyed () {
      this::unmount()
      this._geoloc = undefined
    }
  }

  /**
   * @return {void}
   * @private
   */
  function initialize () {
    /**
     * @type {ol.Geolocation}
     * @protected
     */
    this._geoloc = new Geolocation({
      tracking: this.tracking,
      projection: DATA_PROJECTION
    })
    this._geoloc.set(VM_PROP, this)
    this::defineAccessors()
  }

  /**
   * @return {void}
   * @private
   */
  function defineAccessors () {
    Object.defineProperties(this, {
      geoloc: {
        enumerable: true,
        get: this.getGeoloc
      }
    })
  }

  /**
   * @return {void}
   * @private
   */
  function mount () {
    this.subscribeAll()
  }

  /**
   * @return {void}
   * @private
   */
  function unmount () {
    assertHasGeoloc(this)

    this.unsubscribeAll()
    this.geoloc.setTracking(false)
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    assertHasGeoloc(this)

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
    const geolocChanges = Observable.combineLatest(
      positionChanges,
      accuracyChanges
    ).throttleTime(60)
      .distinctUntilChanged((a, b) => isEqual(a, b))

    this.subscribeTo(geolocChanges, ([position, accuracy]) => {
      if (!isEqual(position, this.currentPosition)) {
        this.currentPosition = position
      }

      if (accuracy !== this.currentAccuracy) {
        this.currentAccuracy = accuracy
      }

      this.$emit('change', {
        position: this.currentPosition,
        accuracy: this.currentAccuracy
      })
    })
  }
</script>
