<script>
  import Geolocation from 'ol/geolocation'
  import { isEqual } from 'lodash/fp'
  import { VM_PROP } from '../../consts'
  import Observable from '../../rx-ext'
  import { DATA_PROJ } from '../../ol-ext'
  import cmp from '../virt-cmp'
  import { assertHasGeoloc } from '../../utils/assert'

  const props = {
    tracking: {
      type: Boolean,
      default: true
    }
  }

  const methods = {
    /**
     * @return {void}
     * @private
     */
    init () {
      /**
       * @type {ol.Geolocation}
       * @protected
       */
      this._geoloc = new Geolocation({
        tracking: this.tracking,
        projection: DATA_PROJ
      })
      this._geoloc[VM_PROP] = this
    },
    /**
     * @return {void}
     * @protected
     */
    deinit () {
      this._geoloc = undefined
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
      return this._geoloc
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
      assertHasGeoloc(this)

      this.unsubscribeAll()
      this.geoloc.setTracking(false)
    },
    /**
     * @return {void}
     */
    refresh () {
      assertHasGeoloc(this)
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
      assertHasGeoloc(this)
      this.geoloc.setTracking(value)
    }
  }

  export default {
    name: 'vl-geoloc',
    mixins: [cmp],
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
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToGeolocation () {
    assertHasGeoloc(this)

    const ft = 1000 / 30
    // pos
    this.subscribeTo(
      Observable.of(this.geoloc.getPosition())
        .merge(Observable.fromOlEvent(
          this.geoloc,
          'change:position',
          () => this.geoloc.getPosition()
        ))
        .filter(x => x != null)
        .throttleTime(ft)
        .distinctUntilChanged(isEqual),
      position => {
        if (!isEqual(position, this.currentPosition)) {
          this.currentPosition = position
          this.$emit('changeposition', { position })
        }
      }
    )
    // acc
    this.subscribeTo(
      Observable.of(this.geoloc.getAccuracy())
        .merge(Observable.fromOlEvent(
          this.geoloc,
          'change:accuracy',
          () => this.geoloc.getAccuracy()
        ))
        .filter(x => x != null)
        .throttleTime(ft)
        .distinctUntilChanged(isEqual),
      accuracy => {
        if (accuracy !== this.currentAccuracy) {
          this.currentAccuracy = accuracy
          this.$emit('changeaccuracy', { accuracy })
        }
      }
    )
  }
</script>
