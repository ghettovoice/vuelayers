<template>
  <div :id="[$options.name, id].join('-')" :class="$options.name">
    <slot :id="id" :position="position"></slot>
  </div>
</template>

<script>
  import uuid from 'uuid/v4'
  import { isEqual } from 'lodash/fp'
  import { Observable } from 'rxjs/Observable'
  import 'rxjs/add/observable/merge'
  import '../../rx-ext'
  import Overlay from 'ol/overlay'
  import cmp from '../ol-cmp'
  import useMapCmp from '../use-map-cmp'
  import { OVERLAY_POSITIONING, proj as projHelper } from '../../ol-ext'
  import * as assert from '../../utils/assert'

  const props = {
    id: {
      type: [String, Number],
      default: () => uuid(),
    },
    offset: {
      type: Array,
      default: () => [0, 0],
      validator: value => value.length === 2,
    },
    position: {
      type: Array,
      validator: value => value.length === 2,
    },
    positioning: {
      type: String,
      default: OVERLAY_POSITIONING.TOP_LEFT,
      validator: value => Object.values(OVERLAY_POSITIONING).includes(value),
    },
    stopEvent: Boolean,
    insertFirst: {
      type: Boolean,
      default: true,
    },
    autoPan: Boolean,
    autoPanMargin: {
      type: Number,
      default: 20,
    },
    autoPanAnimation: Object,
  }

  const computed = {
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
        autoPanAnimation: this.autoPanAnimation,
      })
    },
    /**
     * @return {void}
     * @protected
     */
    mount () {
      assert.hasOverlay(this)

      this.$overlay.setElement(this.$el)
      this.$overlaysContainer && this.$overlaysContainer.addOverlay(this.$overlay)
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
      this.$overlaysContainer && this.$overlaysContainer.removeOverlay(this.$overlay)
    },
    /**
     * @return {void}
     * @protected
     */
    subscribeAll () {
      this::subscribeToOverlayChanges()
    },
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
    },
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
        rev: 1,
      }
    },
    created () {
      Object.defineProperties(this, {
        /**
         * @type {ol.Overlay|undefined}
         */
        $overlay: {
          enumerable: true,
          get: () => this.$olObject,
        },
        $map: {
          enumerable: true,
          get: () => this.$services && this.$services.map,
        },
        $view: {
          enumerable: true,
          get: () => this.$services && this.$services.view,
        },
        $overlaysContainer: {
          enumerable: true,
          get: () => this.$services && this.$services.overlaysContainer,
        },
      })
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToOverlayChanges () {
    assert.hasOverlay(this)
    assert.hasView(this)

    const ft = 100
    const changes = Observable.merge(
      Observable.fromOlChangeEvent(this.$overlay, 'position', true, ft, this::getPosition),
      Observable.fromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true, ft)
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }

  function getPosition () {
    return projHelper.toLonLat(this.$overlay.getPosition(), this.$view.getProjection())
  }
</script>

<style lang="sass">
  @import ../../styles/all

  .vl-overlay
    +vl-hidden()
</style>
