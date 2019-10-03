<template>
  <div :id="vmId" :class="classes">
    <slot :id="id" :position="position" :offset="offset" :positioning="positioning"/>
  </div>
</template>

<script>
  import Overlay from 'ol/Overlay'
  import { merge as mergeObs } from 'rxjs/observable'
  import { olCmp, projTransforms, useMapCmp } from '../../mixin'
  import { getOverlayId, initializeOverlay, OVERLAY_POSITIONING, setOverlayId } from '../../ol-ext'
  import { observableFromOlChangeEvent } from '../../rx-ext'
  import { hasOverlay } from '../../util/assert'
  import { isEqual, identity } from '../../util/minilo'

  const props = {
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
    className: String,
  }

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
        this.cmpName,
        this.visible ? 'visible' : undefined,
      ].filter(identity)
    },
  }

  const methods = {
    /**
     * @return {module:ol/Overlay~Overlay}
     * @protected
     */
    createOlObject () {
      const overlay = new Overlay({
        id: this.id,
        offset: this.offset,
        position: this.pointToViewProj(this.position),
        positioning: this.positioning,
        stopEvent: this.stopEvent,
        insertFirst: this.insertFirst,
        autoPan: this.autoPan,
        autoPanMargin: this.autoPanMargin,
        autoPanAnimation: this.autoPanAnimation,
        className: this.className,
      })

      initializeOverlay(overlay, this.id)

      return overlay
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
    id (value) {
      if (!this.$overlay || value === getOverlayId(this.$overlay)) return

      setOverlayId(this.$overlay, value)
    },
    offset (value) {
      if (this.$overlay && !isEqual(value, this.$overlay.getOffset())) {
        this.$overlay.setOffset(value)
      }
    },
    position (value) {
      value = this.pointToViewProj(value)
      if (this.$overlay && !isEqual(value, this.$overlay.getPosition())) {
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

  export default {
    name: 'vl-overlay',
    mixins: [olCmp, useMapCmp, projTransforms],
    props,
    computed,
    methods,
    watch,
    created () {
      Object.defineProperties(this, {
        /**
         * @type {module:ol/Overlay~Overlay|undefined}
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

    const changes = mergeObs(
      observableFromOlChangeEvent(this.$overlay, 'position', true, undefined, () => this.pointToDataProj(this.$overlay.getPosition())),
      observableFromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true),
    )

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev

      this.$nextTick(() => {
        this.$emit(`update:${prop}`, value)
      })
    })
  }
</script>
