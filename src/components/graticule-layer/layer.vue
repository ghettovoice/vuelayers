<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <LonStyle>
      <slot name="lon">
        <TextStyle
          font="'12px Calibri,sans-serif'"
          text-baseline="bottom">
          <FillStyle color="rgba(0,0,0,1)" />
          <StrokeStyle
            color="rgba(255,255,255,1)"
            :width="3" />
        </TextStyle>
      </slot>
    </LonStyle>
    <LatStyle>
      <slot name="lat">
        <TextStyle
          font="'12px Calibri,sans-serif'"
          text-baseline="bottom">
          <FillStyle color="rgba(0,0,0,1)" />
          <StrokeStyle
            color="rgba(255,255,255,1)"
            :width="3" />
        </TextStyle>
      </slot>
    </LatStyle>
    <GStrokeStyle>
      <slot name="stroke">
        <StrokeStyle color="rgba(0,0,0,0.2)" />
      </slot>
    </GStrokeStyle>
  </i>
</template>

<script>
  import debounce from 'debounce-promise'
  import GraticuleLayer from 'ol/layer/Graticule'
  import { vectorLayer } from '../../mixin'
  import { dumpStrokeStyle, dumpTextStyle } from '../../ol-ext'
  import { clonePlainObject, isEqual, isFunction, map } from '../../util/minilo'
  import mergeDescriptors from '../../util/multi-merge-descriptors'
  import { makeWatchers } from '../../util/vue-helpers'
  import { FillStyle, StrokeStyle, TextStyle } from '../style'
  import LatStyle from './lat-style.vue'
  import LonStyle from './lon-style.vue'
  import GStrokeStyle from './stroke-style.vue'

  export default {
    name: 'VlLayerGraticule',
    components: {
      LonStyle,
      LatStyle,
      GStrokeStyle,
      TextStyle,
      FillStyle,
      StrokeStyle,
    },
    mixins: [
      vectorLayer,
    ],
    props: {
      // ol/layer/Graticule
      maxLines: {
        type: Number,
        default: 100,
      },
      targetSize: {
        type: Number,
        default: 100,
      },
      showLabels: {
        type: Boolean,
        default: false,
      },
      lonLabelFormatter: Function,
      latLabelFormatter: Function,
      lonLabelPosition: {
        type: Number,
        default: 0,
      },
      latLabelPosition: {
        type: Number,
        default: 1,
      },
      intervals: {
        type: Array,
        default: () => [90, 45, 30, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.005, 0.002, 0.001],
      },
      wrapX: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      currentMeridians () {
        if (!(this.rev && this.$layer)) return []

        return map(this.getMeridiansInternal(), geom => this.writeGeometryInDataProj(geom))
      },
      currentParallels () {
        if (!(this.rev && this.$layer)) return []

        return map(this.getParallelsInternal(), geom => this.writeGeometryInDataProj(geom))
      },
      currentLonLabelStyle () {
        if (!(this.rev && this.$lonLabelStyle)) return

        return dumpTextStyle(this.$lonLabelStyle)
      },
      currentLatLabelStyle () {
        if (!(this.rev && this.$latLabelStyle)) return

        return dumpTextStyle(this.$latLabelStyle)
      },
      currentStrokeStyle () {
        if (!(this.rev && this.$strokeStyle)) return

        return dumpStrokeStyle(this.$strokeStyle)
      },
    },
    watch: {
      currentMeridians: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:meridians', clonePlainObject(value))
        }),
      },
      currentParallels: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:parallels', clonePlainObject(value))
        }),
      },
      currentLonLabelStyle: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:lonLabelStyle', clonePlainObject(value))
        }),
      },
      currentLatLabelStyle: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:latLabelStyle', clonePlainObject(value))
        }),
      },
      currentStrokeStyle: {
        deep: true,
        handler: /*#__PURE__*/debounce(function (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:strokeStyle', clonePlainObject(value))
        }),
      },
      .../*#__PURE__*/makeWatchers([
        'maxLines',
        'targetSize',
        'showLabels',
        'lonLabelFormatter',
        'latLabelFormatter',
        'lonLabelPosition',
        'latLabelPosition',
        'intervals',
        'wrapX',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      this._lonLabelStyle = undefined
      this._lonLabelStyleVm = undefined
      this._latLabelStyle = undefined
      this._latLabelStyleVm = undefined
      this._strokeStyle = undefined
      this._strokeStyleVm = undefined

      Object.defineProperties(this, {
        $lonLabelStyle: {
          enumerable: true,
          get: this.getLonLabelStyle,
        },
        $lonLabelStyleVm: {
          enumerable: true,
          get: () => this._lonLabelStyleVm,
        },
        $latLabelStyle: {
          enumerable: true,
          get: this.getLatLabelStyle,
        },
        $latLabelStyleVm: {
          enumerable: true,
          get: () => this._latLabelStyleVm,
        },
        $strokeStyle: {
          enumerable: true,
          get: this.getStrokeStyle,
        },
        $strokeStyleVm: {
          enumerable: true,
          get: () => this._strokeStyleVm,
        },
      })
    },
    methods: {
      createLayer () {
        return new GraticuleLayer({
          // ol/layer/Base
          className: this.className,
          opacity: this.currentOpacity,
          visible: this.currentVisible,
          extent: this.currentExtentViewProj,
          zIndex: this.currentZIndex,
          minResolution: this.currentMinResolution,
          maxResolution: this.currentMaxResolution,
          minZoom: this.currentMinZoom,
          maxZoom: this.currentMaxZoom,
          // ol/layer/Graticule
          maxLines: this.maxLines,
          strokeStyle: this.$strokeStyle,
          targetSize: this.targetSize,
          showLabels: this.showLabels,
          lonLabelFormatter: this.lonLabelFormatter,
          latLabelFormatter: this.latLabelFormatter,
          lonLabelPosition: this.lonLabelPosition,
          latLabelPosition: this.latLabelPosition,
          lonLabelStyle: this.$lonLabelStyle,
          latLabelStyle: this.$latLabelStyle,
          intervals: this.intervals,
          wrapX: this.wrapX,
        })
      },
      getServices () {
        const vm = this

        return mergeDescriptors(
          this::vectorLayer.methods.getServices(),
          {
            get lonStyleContainer () { return vm },
            get latStyleContainer () { return vm },
            get strokeStyleContainer () { return vm },
          },
        )
      },
      async getMeridians () {
        await this.resolveLayer()

        return this.getMeridiansInternal()
      },
      getMeridiansInternal () {
        return this.$layer.getMeridians()
      },
      async getParallels () {
        await this.resolveLayer()

        return this.getParallelsInternal()
      },
      getParallelsInternal () {
        return this.$layer.getParallels()
      },
      getLonLabelStyle () {
        return this._lonLabelStyle
      },
      async setLonLabelStyle (style) {
        if (style && isFunction(style.resolveOlObject)) {
          style = await style.resolveOlObject()
        }
        style || (style = undefined)

        if (style === this._lonLabelStyle) return

        this._lonLabelStyle = style
        this._lonLabelStyleVm = style?.vm && style.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('lonLabelStyle changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      getLatLabelStyle () {
        return this._latLabelStyle
      },
      async setLatLabelStyle (style) {
        if (style && isFunction(style.resolveOlObject)) {
          style = await style.resolveOlObject()
        }
        style || (style = undefined)

        if (style === this._latLabelStyle) return

        this._latLabelStyle = style
        this._latLabelStyleVm = style?.vm && style.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('latLabelStyle changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      getStrokeStyle () {
        return this._strokeStyle
      },
      async setStrokeStyle (style) {
        if (style && isFunction(style.resolveOlObject)) {
          style = await style.resolveOlObject()
        }
        style || (style = undefined)

        if (style === this._strokeStyle) return

        this._strokeStyle = style
        this._strokeStyleVm = style?.vm && style.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('strokeStyle changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
    },
  }
</script>
