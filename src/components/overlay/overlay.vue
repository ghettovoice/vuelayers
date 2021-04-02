<template>
  <div
    :id="vmId"
    :class="classes">
    <slot
      :id="currentId"
      :position="currentPositionDataProj"
      :offset="currentOffset"
      :positioning="currentPositioning" />
  </div>
</template>

<script>
  import { Overlay } from 'ol'
  import OverlayPositioning from 'ol/OverlayPositioning'
  import { makeChangeOrRecreateWatchers, olCmp, projTransforms, waitForMap } from '../../mixins'
  import { EPSG_3857, getOverlayId, initializeOverlay, roundPointCoords, setOverlayId } from '../../ol-ext'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import {
    addPrefix,
    assert,
    clonePlainObject,
    coalesce,
    identity,
    isArray,
    isEqual,
    isPlainObject,
  } from '../../utils'

  export default {
    name: 'VlOverlay',
    mixins: [
      projTransforms,
      olCmp,
      waitForMap,
    ],
    props: {
      offset: {
        type: Array,
        default: () => [0, 0],
        validator: value => value.length === 2,
      },
      position: {
        type: Array,
        validator: value => value.length === 2,
        // required: true,
      },
      positioning: {
        type: String,
        default: OverlayPositioning.TOP_LEFT,
        validator: value => Object.values(OverlayPositioning).includes(value),
      },
      stopEvent: {
        type: Boolean,
        default: true,
      },
      insertFirst: {
        type: Boolean,
        default: true,
      },
      autoPan: [Boolean, Object],
      autoPanMargin: Number,
      autoPanAnimation: Object,
      autoPanOptions: Object,
      className: String,
    },
    data () {
      return {
        visible: false,
        viewProjection: EPSG_3857,
        dataProjection: EPSG_3857,
        currentOffset: this.offset.slice(),
        currentPositionViewProj: roundPointCoords(this.position),
        currentPositioning: this.positioning,
      }
    },
    computed: {
      positionDataProj () {
        return roundPointCoords(this.position)
      },
      positionViewProj () {
        return this.pointToViewProj(this.position)
      },
      currentPositionDataProj () {
        return this.pointToDataProj(this.currentPositionViewProj)
      },
      inputOffset () {
        return this.offset.slice()
      },
      inputAutoPan () {
        return isPlainObject(this.autoPan)
          ? clonePlainObject(this.autoPan)
          : this.autoPan
      },
      inputAutoPanAnimation () {
        return isPlainObject(this.autoPanAnimation)
          ? clonePlainObject(this.autoPanAnimation)
          : this.autoPanAnimation
      },
      inputAutoPanOptions () {
        return isPlainObject(this.autoPanOptions)
          ? clonePlainObject(this.autoPanOptions)
          : this.autoPanOptions
      },
      classes () {
        return [
          this.vmClass,
          this.visible ? 'visible' : undefined,
        ].filter(identity)
      },
    },
    watch: {
      rev () {
        if (!this.$overlay) return

        if (!isEqual(this.currentOffset, this.$overlay.getOffset())) {
          this.currentOffset = this.$overlay.getOffset()
        }
        if (!isEqual(this.currentPositionViewProj, this.$overlay.getPosition())) {
          this.currentPositionViewProj = this.$overlay.getPosition()
        }
        if (this.currentPositioning !== this.$overlay.getPositioning()) {
          this.currentPositioning = this.$overlay.getPositioning()
        }
      },
      inputOffset: {
        deep: true,
        handler (value) {
          this.setOffset(value)
        },
      },
      currentOffset: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.inputOffset)) return

          this.$emit('update:offset', value.slice())
        },
      },
      positionViewProj: {
        deep: true,
        handler (value) {
          this.setPosition(value, true)
        },
      },
      currentPositionDataProj: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.positionDataProj)) return

          this.$emit('update:position', value?.slice())
        },
      },
      positioning (value) {
        this.setPositioning(value)
      },
      currentPositioning (value) {
        if (value === this.positioning) return

        this.$emit('update:positioning', value)
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'stopEvent',
        'insertFirst',
        'autoPanMargin',
        'className',
        'inputAutoPan',
        'inputAutoPanAnimation',
        'inputAutoPanOptions',
      ], [
        'inputAutoPan',
        'inputAutoPanAnimation',
        'inputAutoPanOptions',
      ]),
    },
    methods: {
      /**
       * @return {Promise<void>}
       * @protected
       */
      async beforeInit () {
        this::defineServices()

        await Promise.all([
          this::olCmp.methods.beforeInit(),
          this::waitForMap.methods.beforeInit(),
        ])
      },
      /**
       * @return {module:ol/Overlay~Overlay}
       * @protected
       */
      createOlObject () {
        const overlay = new Overlay({
          id: this.currentId,
          element: this.$el,
          offset: this.currentOffset,
          position: this.currentPositionViewProj,
          positioning: this.currentPositioning,
          stopEvent: this.stopEvent,
          insertFirst: this.insertFirst,
          autoPan: this.inputAutoPan,
          autoPanMargin: this.autoPanMargin,
          autoPanAnimation: this.inputAutoPanAnimation,
          autoPanOptions: this.inputAutoPanOptions,
          className: this.className,
        })
        initializeOverlay(overlay, this.currentId)

        return overlay
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async mount () {
        this.visible = true
        this.$overlaysContainer?.addOverlay(this.$overlay)

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        this.$overlaysContainer?.removeOverlay(this.$overlay)
        this.visible = false

        return this::olCmp.methods.unmount()
      },
      /**
       * @return {void}
       * @protected
       */
      subscribeAll () {
        this::olCmp.methods.subscribeAll()
        this::subscribeToOverlayChanges()
      },
      /**
       * @return {*}
       * @protected
       */
      getIdInternal () {
        return getOverlayId(this.$overlay)
      },
      /**
       * @param {*} id
       * @protected
       */
      setIdInternal (id) {
        if (id === this.getIdInternal()) return

        setOverlayId(this.$overlay, id)
      },
      /**
       * @return {Promise<module:ol/Overlay~Overlay>}
       */
      resolveOverlay: olCmp.methods.resolveOlObject,
      getOffset () {
        return coalesce(this.$overlay?.getOffset(), this.currentOffset)
      },
      setOffset (offset) {
        assert(isArray(offset) && offset.length === 2, 'Invalid offset')
        offset = offset.slice()

        if (!isEqual(offset, this.currentOffset)) {
          this.currentOffset = offset
        }
        if (this.$overlay && !isEqual(offset, this.$overlay.getOffset())) {
          this.$overlay.setOffset(offset)
        }
      },
      getPosition (viewProj = false) {
        if (!this.$overlay) {
          return viewProj ? this.currentPositionViewProj : this.currentPositionDataProj
        }

        const position = this.$overlay.getPosition()
        if (viewProj) return roundPointCoords(position)

        return this.pointToDataProj(position)
      },
      setPosition (position, viewProj = false) {
        assert(position == null || (isArray(position) && position.length === 2), 'Invalid position')
        position = position?.slice()

        if (!viewProj) {
          position = this.pointToViewProj(position)
        }

        if (!isEqual(position, this.currentPositionViewProj)) {
          this.currentPositionViewProj = position
        }
        if (this.$overlay && !isEqual(position, this.$overlay.getPosition())) {
          this.$overlay.setPosition(position)
        }
      },
      getPositioning () {
        return this.$overlay?.getPositioning() || this.currentPositioning
      },
      setPositioning (positioning) {
        if (positioning !== this.currentPositioning) {
          this.currentPositioning = positioning
        }
        if (this.$overlay && positioning !== this.$overlay.getPositioning()) {
          this.$overlay.setPositioning(positioning)
        }
      },
      async panIntoView (options = {}) {
        (await this.resolveOverlay()).panIntoView(options)
      },
    },
  }

  function defineServices () {
    Object.defineProperties(this, {
      $overlay: {
        enumerable: true,
        get: () => this.$olObject,
      },
      $mapVm: {
        enumerable: true,
        get: () => this.$services?.mapVm,
      },
      $viewVm: {
        enumerable: true,
        get: () => this.$services?.viewVm,
      },
      $overlaysContainer: {
        enumerable: true,
        get: () => this.$services?.overlaysContainer,
      },
    })
  }

  /**
   * @return {void}
   * @private
   */
  function subscribeToOverlayChanges () {
    const setterKey = addPrefix('set')
    const propChanges = obsFromOlChangeEvent(this.$overlay, [
      'offset',
      'position',
      'positioning',
    ], true, evt => ({
      ...evt,
      setter: val => {
        const args = [val]
        if (evt.prop === 'position') {
          args.push(true)
        }
        this[setterKey(evt.prop)](...args)
      },
    }))
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
  }
</script>
