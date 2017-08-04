<script>
  import uuid from 'uuid/v4'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/map'
  import '../../rx-ext'
  import Overlay from 'ol/overlay'
  import cmp from '../ol-virt-cmp'
  import { OVERLAY_POSITIONING, proj as projHelper } from '../../ol-ext'
  import * as assert from '../../utils/assert'

  const props = {
    id: {
      type: [String, Number],
      default: () => uuid()
    },
    offset: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2
    },
    position: {
      type: Array,
      validator: value => value.length === 2
    },
    positioning: {
      type: String,
      default: Object.values(OVERLAY_POSITIONING),
      validator: value => Object.values(OVERLAY_POSITIONING).includes(value)
    },
    stopEvent: Boolean,
    insertFirst: {
      type: Boolean,
      default: true
    },
    autoPan: {
      type: Boolean,
      default: true
    },
    autoPanMargin: {
      type: Number,
      default: 20
    },
    autoPanAnimation: Object
  }

  const methods = {
    /**
     * @return {ol.Overlay}
     * @protected
     */
    createOlObject () {
      return new Overlay({
        id: this.id,
        offset: this.offset,
        position: projHelper.fromLonLat(this.position, this.$view.getProjection()),
        positioning: this.positioning,
        stopEvent: this.stopEvent,
        insertFirst: this.insertFirst,
        autoPan: this.autoPan,
        autoPanMargin: this.autoPanMargin,
        autoPanAnimation: this.autoPanAnimation
      })
    },
    /**
     * @return {void}
     * @protected
     */
    defineAccessors () {
      Object.defineProperties(this, {
        $overlay: {
          enumerable: true,
          get: this.getOverlay
        },
        $map: {
          enumerable: true,
          get: this.$services && this.$services.map
        },
        $view: {
          enumerable: true,
          get: this.$services && this.$services.view
        }
      })
    },
    /**
     * @return {ol.Overlay|undefined}
     */
    getOverlay () {
      return this.$olObject
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      assert.hasOverlay(this)

      this.$overlay.setElement(this.$el)
      this.$parent && this.$parent.addOverlay(this)
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      assert.hasOverlay(this)

      this.unsubscribeAll()
      this.$overlay.setElement(undefined)
      this.$parent && this.$parent.removeOverlay(this)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToOverlayChanges()
    }
  }

  const watch = {
    offset (value) {
      if (this.$overlay && !isEqual(value, this.$overlay.getOffset())) {
        this.$overlay.setOffset(value)
      }
    },
    position (value) {
      if (
        this.$overlay &&
        this.$view &&
        !isEqual(value, projHelper.toLonLat(this.$overlay.getPosition(), this.$view.getProjection()))
      ) {
        this.$overlay.setPosition(projHelper.fromLonLat(value, this.$view.getProjection()))
      }
    },
    positioning (value) {
      if (this.$overlay && value !== this.$overlay.getPositioning()) {
        this.$overlay.setPositioning(value)
      }
    }
  }

  // todo add scoped slot support?
  export default {
    name: 'vl-overlay',
    mixins: [cmp],
    props,
    methods,
    watch,
    stubVNode: {
      attrs () {
        return {
          id: [this.$options.name, this.id].join('-'),
          class: this.$options.name
        }
      }
    }
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToOverlayChanges () {
    assert.hasOverlay(this)
    assert.hasView(this)

    const ft = 100
    const getPosition = () => projHelper.toLonLat(this.$overlay.getPosition(), this.$view.getProjection())

    const events = Observable.merge(
      Observable.fromOlChangeEvent(this.$overlay, 'position', true, ft, getPosition),
      Observable.fromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning'
      ], true, ft)
    ).map(({ prop, value }) => ({
      name: `update:${prop}`,
      value
    }))

    this.subscribeTo(events, ({ name, value }) => this.$emit(name, value))
  }
</script>
