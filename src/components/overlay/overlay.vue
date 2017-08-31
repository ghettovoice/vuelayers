<template>
  <div :id="[$options.name, id].join('-')" :class="$options.name">
    <slot></slot>
  </div>
</template>

<script>
  import uuid from 'uuid/v4'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import 'rxjs/add/operator/map'
  import '../../rx-ext'
  import Overlay from 'ol/overlay'
  import cmp from '../ol-cmp'
  import useMapCmp from '../use-map-cmp'
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
      default: OVERLAY_POSITIONING.TOP_LEFT,
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

  const computed = {
    currentPosition () {
      if (this.rev && this.$overlay) {
        return this::getPosition()
      }

      return this.position
    }
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
      this.$map && this.$map.addOverlay(this.$overlay)
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
      this.$map && this.$map.removeOverlay(this.$overlay)
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
    mixins: [cmp, useMapCmp],
    props,
    computed,
    methods,
    watch,
    data () {
      return {
        rev: 1
      }
    },
    created () {
      Object.defineProperties(this, {
        $overlay: {
          enumerable: true,
          get: this.getOverlay
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view
        }
      })
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
    const events = Observable.merge(
      Observable.fromOlChangeEvent(this.$overlay, 'position', true, ft, this::getPosition),
      Observable.fromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning'
      ], true, ft)
    ).map(({ prop, value }) => ({
      name: `update:${prop}`,
      value
    }))

    this.subscribeTo(events, ({ name, value }) => {
      ++this.rev
      this.$emit(name, value)
    })
  }

  function getPosition () {
    return projHelper.toLonLat(this.$overlay.getPosition(), this.$view.getProjection())
  }
</script>
