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
  import debounce from 'debounce-promise'
  import { Overlay } from 'ol'
  import OverlayPositioning from 'ol/OverlayPositioning'
  import { from as fromObs, merge as mergeObs } from 'rxjs'
  import { map as mapObs, mergeMap, skipWhile } from 'rxjs/operators'
  import { olCmp, OlObjectEvent, projTransforms } from '../../mixin'
  import { getOverlayId, initializeOverlay, roundPointCoords, setOverlayId } from '../../ol-ext'
  import {
    fromOlChangeEvent as obsFromOlChangeEvent,
    fromVueEvent as obsFromVueEvent,
    fromVueWatcher as obsFromVueWatcher,
  } from '../../rx-ext'
  import { addPrefix, assert, clonePlainObject, hasProp, identity, isEqual, makeWatchers, waitFor } from '../../util'

  export default {
    name: 'VlOverlay',
    mixins: [
      projTransforms,
      olCmp,
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
        required: true,
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
      autoPan: {
        type: Boolean,
        default: false,
      },
      autoPanMargin: {
        type: Number,
        default: 20,
      },
      autoPanAnimation: Object,
      autoPanOptions: Object,
      className: String,
    },
    data () {
      return {
        visible: false,
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
        if (this.rev && this.$overlay) {
          return this.getPositionInternal()
        }

        return this.positionDataProj
      },
      currentPositionViewProj () {
        if (this.rev && this.$overlay) {
          return this.getPositionInternal(true)
        }

        return this.positionViewProj
      },
      currentPositioning () {
        if (this.rev && this.$overlay) {
          return this.getPositioningInternal()
        }

        return this.positioning
      },
      currentOffset () {
        if (this.rev && this.$overlay) {
          return this.getOffsetInternal()
        }

        return this.offset
      },
      classes () {
        return [
          this.vmClass,
          this.visible ? 'visible' : undefined,
        ].filter(identity)
      },
    },
    watch: {
      offset: {
        deep: true,
        async handler (value) {
          await this.setOffset(value)
        },
      },
      currentOffset: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value) {
          if (isEqual(value, this.offset)) return

          this.$emit('update:offset', clonePlainObject(value))
        }),
      },
      positionDataProj: {
        deep: true,
        async handler (value) {
          await this.setPosition(value)
        },
      },
      currentPositionDataProj: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value) {
          if (isEqual(value, this.positionDataProj)) return

          this.$emit('update:position', clonePlainObject(value))
        }),
      },
      async positioning (value) {
        await this.setPositioning(value)
      },
      currentPositioning: /*#__PURE__*/debounce(function (value) {
        if (value === this.positioning) return

        this.$emit('update:positioning', value)
      }),
      .../*#__PURE__*/makeWatchers([
        'stopEvent',
        'insertFirst',
        'autoPan',
        'autoPanMargin',
        'autoPanAnimation',
        'autoPanOptions',
        'className',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      this::defineServices()
    },
    methods: {
      /**
       * @return {Promise<void>}
       * @protected
       */
      async beforeInit () {
        try {
          await waitFor(
            () => this.$mapVm != null,
            obsFromVueEvent(this.$eventBus, [
              OlObjectEvent.CREATE_ERROR,
            ]).pipe(
              mapObs(([vm]) => hasProp(vm, '$map') && this.$vq.closest(vm)),
            ),
            1000,
          )
          this.dataProjection = this.$mapVm.resolvedDataProjection
          const dataProjChanges = obsFromVueWatcher(this, () => this.$mapVm.resolvedDataProjection)
          this.subscribeTo(dataProjChanges, ({ value }) => { this.dataProjection = value })
          await this.$nextTickPromise()

          return this::olCmp.methods.beforeInit()
        } catch (err) {
          err.message = 'Wait for $mapVm injection: ' + err.message
          throw err
        }
      },
      /**
       * @return {module:ol/Overlay~Overlay}
       * @protected
       */
      createOlObject () {
        const overlay = new Overlay({
          id: this.id,
          offset: this.currentOffset,
          position: this.currentPositionDataProj,
          positioning: this.currentPositioning,
          stopEvent: this.stopEvent,
          insertFirst: this.insertFirst,
          autoPan: this.autoPan,
          autoPanMargin: this.autoPanMargin,
          autoPanAnimation: this.autoPanAnimation,
          autoPanOptions: this.autoPanOptions,
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
        this.$overlay.setElement(this.$el)
        if (this.$overlaysContainer) {
          await this.$overlaysContainer.addOverlay(this.$overlay)
        }
        // reset position to trigger panIntoView
        this.$nextTick(async () => {
          await this.setPosition(this.positionDataProj)
          this.visible = true
        })

        return this::olCmp.methods.mount()
      },
      /**
       * @return {Promise<void>}
       * @protected
       */
      async unmount () {
        this.$overlay.setElement(undefined)
        if (this.$overlaysContainer) {
          await this.$overlaysContainer.removeOverlay(this.$overlay)
        }
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
      resolveOverlay: olCmp.methods.resolveOlObject,
      getIdInternal () {
        return getOverlayId(this.$overlay)
      },
      setIdInternal (id) {
        assert(id != null && id !== '', 'Invalid feature id')

        if (id === this.getIdInternal()) return

        setOverlayId(this.$overlay, id)
      },
      async getOffset () {
        await this.resolveOverlay()

        return this.getOffsetInternal()
      },
      getOffsetInternal () {
        return this.$overlay.getOffset()
      },
      async setOffset (offset) {
        if (isEqual(offset, await this.getOffset())) return

        (await this.resolveOverlay()).setOffset(offset)
      },
      async getPosition (viewProj = false) {
        await this.resolveOverlay()

        return this.getPositionInternal(viewProj)
      },
      getPositionInternal (viewProj = false) {
        const position = this.$overlay.getPosition()
        if (viewProj) {
          return roundPointCoords(position)
        }

        return this.pointToDataProj(position)
      },
      async setPosition (position, viewProj = false) {
        if (isEqual(position, await this.getPosition(viewProj))) return
        if (!viewProj) {
          position = this.pointToViewProj(position)
        }

        (await this.resolveOverlay()).setPosition(position)
      },
      async getPositioning () {
        await this.resolveOverlay()

        return this.getPositioningInternal()
      },
      getPositioningInternal () {
        return this.$overlay.getPositioning()
      },
      async setPositioning (positioning) {
        if (positioning === await this.getPositioning()) return

        (await this.resolveOverlay()).setPositioning(positioning)
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
    const prefixKey = addPrefix('current')
    const positionChanges = obsFromOlChangeEvent(this.$overlay, 'position', true).pipe(
      mergeMap(({ prop }) => fromObs(this.getPosition()).pipe(
        mapObs(position => ({
          prop,
          value: position,
          compareWith: this.currentPositionDataProj,
        })),
      )),
    )
    const propChanges = mergeObs(
      obsFromOlChangeEvent(this.$overlay, [
        'offset',
        'positioning',
      ], true, evt => ({
        ...evt,
        compareWith: this[prefixKey(evt.prop)],
      })),
      positionChanges,
    ).pipe(
      skipWhile(({ value, compareWith }) => isEqual(value, compareWith)),
    )
    this.subscribeTo(propChanges, () => {
      ++this.rev
    })
  }
</script>
