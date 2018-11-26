<template>
  <div :id="[$options.name, id].join('-')" :class="classes">
    <slot :id="id" :position="position" :offset="offset" :positioning="positioning"/>
  </div>
</template>

<script>
  import Overlay from 'ol/Overlay'
  import { merge as mergeObs } from 'rxjs/observable'
  import uuid from 'uuid/v4'
  import olCmp from '../../mixin/ol-cmp'
  import projTransforms from '../../mixin/proj-transforms'
  import useMapCmp from '../../mixin/use-map-cmp'
  import { OVERLAY_POSITIONING } from '../../ol-ext/consts'
  import observableFromOlChangeEvent from '../../rx-ext/from-ol-change-event'
  import { hasOverlay } from '../../util/assert'
  import { isEqual, identity } from '../../util/minilo'

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
    insertFirst: {
      type: Boolean,
      default: true,
    },
    autoPan: {
      type: Boolean,
      default: false,
    },
    autoPanMargin: {
      type: Number,
      default: 20,
    },
    autoPanAnimation: Object,
  }

  /**
   * @vueComputed
   */
  const computed = {
    positionViewProj () {
      if (this.rev && this.$overlay) {
        return this.$overlay.getPosition()
      }
    },
    positionDataProj () {
      if (this.rev && this.$overlay) {
        return this.pointToDataProj(this.$overlay.getPosition())
      }
    },
    classes () {
      return [
        this.$options.name,
        this.visible ? 'visible' : undefined,
      ].filter(identity)
    },
  }

  /**
   * @vueMethods
   */
  const methods = /** @lends module:overlay/overlay# */{
    /**
     * @return {Overlay}
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
      hasOverlay(this)

      this.$overlay.setElement(this.$el)
      this.$overlaysContainer && this.$overlaysContainer.addOverlay(this.$overlay)
      // reset position to trigger panIntoView
      this.$nextTick(() => {
        this.$overlay.setPosition(this.positionViewProj.slice())
        this.visible = true
      })
      this.subscribeAll()
    },
    /**
     * @return {void}
     * @protected
     */
    unmount () {
      hasOverlay(this)

      this.unsubscribeAll()
      this.$overlay.setElement(undefined)
      this.$overlaysContainer && this.$overlaysContainer.removeOverlay(this.$overlay)
      this.visible = false
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
      value = this.pointToViewProj(value)
      if (this.$overlay && !isEqual(value, this.positionViewProj)) {
        this.$overlay.setPosition(value)
      }
    },
    positioning (value) {
      if (this.$overlay && value !== this.$overlay.getPositioning()) {
        this.$overlay.setPositioning(value)
      }
    },
    resolvedDataProjection () {
      if (this.$overlay) {
        this.$overlay.setPosition(this.pointToViewProj(this.position))
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
         * @type {Overlay|undefined}
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
    data () {
      return {
        visible: false,
      }
    },
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToOverlayChanges () {
    hasOverlay(this)

    const ft = 1000 / 60
    const changes = mergeObs(
      observableFromOlChangeEvent(this.$overlay, 'position', true, ft,
        () => this.pointToDataProj(this.$overlay.getPosition())),
      observableFromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true, ft),
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev
      this.$emit(`update:${prop}`, value)
    })
  }
</script>
