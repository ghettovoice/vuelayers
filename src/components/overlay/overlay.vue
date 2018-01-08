<template>
  <div :id="[$options.name, id].join('-')" :class="$options.name" style="visibility: hidden">
    <slot :id="id" :position="position"></slot>
  </div>
</template>

<script>
  /** @module overlay/overlay */
  import uuid from 'uuid/v4'
  import { isEqual } from 'lodash/fp'
  import Overlay from 'ol/overlay'
  import { Observable } from 'rxjs/Observable'
  import { merge as mergeObs } from 'rxjs/observable/merge'
  import {
    OVERLAY_POSITIONING,
    olCmp,
    useMapCmp,
    assert,
    observableFromOlChangeEvent,
    projTransforms,
  } from '../../core'

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
    /**
     * Coordinates in the map view projection.
     * @type {number[]}
     */
    position: {
      type: Array,
      validator: value => value.length === 2,
      required: true,
    },
    positioning: {
      type: String,
      default: OVERLAY_POSITIONING.TOP_LEFT,
      validator: value => Object.values(OVERLAY_POSITIONING).includes(value),
    },
    stopEvent: {
      type: Boolean,
      default: true,
    },
    insertFirst: Boolean,
    autoPan: Boolean,
    autoPanMargin: {
      type: Number,
      default: 20,
    },
    autoPanAnimation: Object,
  }

  const computed = {
    viewProjPosition () {
      if (this.rev && this.$overlay) {
        return this.pointToViewProj(this.$overlay.getPosition())
      }
      return []
    },
    bindProjPosition () {
      if (this.rev && this.$overlay) {
        return this.pointToBindProj(this.$overlay.getPosition())
      }
      return []
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:overlay/overlay# */{
    /**
     * @return {ol.Overlay}
     * @protected
     */
    createOlObject () {
      return new Overlay({
        id: this.id,
        offset: this.offset,
        position: this.pointToViewProj(this.position),
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

      this.$overlay.once('change:element', () => {
        this.$el.style.visibility = 'visible'
      })
      this.$overlay.setElement(this.$el)
      this.$overlaysContainer && this.$overlaysContainer.addOverlay(this.$overlay)
      this.subscribeAll()
      this.refresh()
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
    /**
     * Refresh internal ol objects
     * @return {Promise}
     */
    refresh () {
      return Promise.all([
        olCmp.methods.refresh(),
        new Promise(resolve => {
          this.$overlay.once('change:position', () => resolve())
          this.$overlay.setPosition(this.viewProjPosition)
        }),
      ])
    },
  }

  const watch = {
    offset (value) {
      if (this.$overlay && !isEqual(value, this.$overlay.getOffset())) {
        this.$overlay.setOffset(value)
      }
    },
    position (value) {
      if (this.$overlay && !isEqual(value, this.bindProjPosition)) {
        this.$overlay.setPosition(this.pointToViewProj(value))
      }
    },
    positioning (value) {
      if (this.$overlay && value !== this.$overlay.getPositioning()) {
        this.$overlay.setPositioning(value)
      }
    },
  }

  /**
   * @alias module:overlay/overlay
   * @title vl-overlay
   * @vueProto
   */
  export default {
    name: 'vl-overlay',
    mixins: [olCmp, useMapCmp, projTransforms],
    props,
    computed,
    methods,
    watch,
    created () {
      Object.defineProperties(this, /** @lends module:overlay/overlay# */{
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

    const ft = 100
    const changes = Observable::mergeObs(
      observableFromOlChangeEvent(this.$overlay, 'position', true, ft, () => this.pointToBindProj(this.$overlay.getPosition())),
      observableFromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true, ft)
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
