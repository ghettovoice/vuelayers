<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <LonStyle :id="'vl-' + currentId + '-lon-style'">
      <slot name="lon">
        <TextStyle
          :id="'vl-' + currentId + '-default-text-style'"
          font="'12px sans-serif'"
          text-baseline="bottom">
          <FillStyle
            :id="'vl-' + currentId + '-default-fill-style'"
            color="rgba(0,0,0,1)" />
          <StrokeStyle
            :id="'vl-' + currentId + '-default-stroke-style'"
            color="rgba(255,255,255,1)"
            :width="3" />
        </TextStyle>
      </slot>
    </LonStyle>
    <LatStyle :id="'vl-' + currentId + '-lat-style'">
      <slot name="lat">
        <TextStyle
          :id="'vl-' + currentId + '-default-text-style'"
          font="'12px Calibri,sans-serif'"
          text-baseline="bottom">
          <FillStyle
            :id="'vl-' + currentId + '-default-fill-style'"
            color="rgba(0,0,0,1)" />
          <StrokeStyle
            :id="'vl-' + currentId + '-default-stroke-style'"
            color="rgba(255,255,255,1)"
            :width="3" />
        </TextStyle>
      </slot>
    </LatStyle>
    <GStrokeStyle :id="'vl-' + currentId + '-graticule-style'">
      <slot name="stroke">
        <StrokeStyle
          :id="'vl-' + currentId + '-default-graticule-stroke-style'"
          color="rgba(0,0,0,0.2)" />
      </slot>
    </GStrokeStyle>
  </i>
</template>

<script>
  import GraticuleLayer from 'ol/layer/Graticule'
  import { Stroke, Text } from 'ol/style'
  import { makeChangeOrRecreateWatchers, vectorLayer } from '../../mixins'
  import { dumpStrokeStyle, dumpTextStyle } from '../../ol-ext'
  import { assert, clonePlainObject, coalesce, isEqual, map, mergeDescriptors } from '../../utils'
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
      inputIntervals () {
        return this.intervals?.slice()
      },
      meridians () {
        if (!this.rev) return []

        return map(this.getMeridians(), geom => this.writeGeometryInDataProj(geom))
      },
      parallels () {
        if (!this.rev) return []

        return map(this.getParallels(), geom => this.writeGeometryInDataProj(geom))
      },
      lonLabelStyle () {
        if (!(this.rev && this.$lonLabelStyle)) return

        return dumpTextStyle(this.$lonLabelStyle)
      },
      latLabelStyle () {
        if (!(this.rev && this.$latLabelStyle)) return

        return dumpTextStyle(this.$latLabelStyle)
      },
      strokeStyle () {
        if (!(this.rev && this.$strokeStyle)) return

        return dumpStrokeStyle(this.$strokeStyle)
      },
    },
    watch: {
      meridians: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:meridians', clonePlainObject(value))
        },
      },
      parallels: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:parallels', clonePlainObject(value))
        },
      },
      lonLabelStyle: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:lonLabelStyle', value && clonePlainObject(value))
        },
      },
      latLabelStyle: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:latLabelStyle', value && clonePlainObject(value))
        },
      },
      strokeStyle: {
        deep: true,
        handler (value, prev) {
          if (isEqual(value, prev)) return

          this.$emit('update:strokeStyle', value && clonePlainObject(value))
        },
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'maxLines',
        'targetSize',
        'showLabels',
        'lonLabelFormatter',
        'latLabelFormatter',
        'lonLabelPosition',
        'latLabelPosition',
        'inputIntervals',
        'wrapX',
      ], [
        'inputIntervals',
      ]),
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
          get: this.getLonLabelStyleVm,
        },
        $latLabelStyle: {
          enumerable: true,
          get: this.getLatLabelStyle,
        },
        $latLabelStyleVm: {
          enumerable: true,
          get: this.getLatLabelStyleVm,
        },
        $strokeStyle: {
          enumerable: true,
          get: this.getStrokeStyle,
        },
        $strokeStyleVm: {
          enumerable: true,
          get: this.getStrokeStyleVm,
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
          // ol/layer/Layer
          render: this.render,
          // ol/layer/Vector
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          style: this.$style,
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
          intervals: this.inputIntervals,
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
      getMeridians () {
        return coalesce(this.$layer?.getMeridians(), [])
      },
      getParallels () {
        return coalesce(this.$layer?.getParallels(), [])
      },
      getLonLabelStyle () {
        return this._lonLabelStyle
      },
      getLonLabelStyleVm () {
        return this._lonLabelStyleVm
      },
      setLonLabelStyle (style) {
        style = style?.$style || style
        style || (style = undefined)
        assert(!style || style instanceof Text, 'Invalid lon label style')

        if (style === this._lonLabelStyle) return

        this._lonLabelStyle = style
        this._lonLabelStyleVm = style?.vm && style?.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('lonLabelStyle changed, scheduling recreate...')
        }

        this.scheduleRecreate()
      },
      getLatLabelStyle () {
        return this._latLabelStyle
      },
      getLatLabelStyleVm () {
        return this._latLabelStyleVm
      },
      setLatLabelStyle (style) {
        style = style?.$style || style
        style || (style = undefined)
        assert(!style || style instanceof Text, 'Invalid lat label style')

        if (style === this._latLabelStyle) return

        this._latLabelStyle = style
        this._latLabelStyleVm = style?.vm && style?.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('latLabelStyle changed, scheduling recreate...')
        }

        this.scheduleRecreate()
      },
      getStrokeStyle () {
        return this._strokeStyle
      },
      getStrokeStyleVm () {
        return this._strokeStyleVm
      },
      setStrokeStyle (style) {
        style = style?.$style
        style || (style = undefined)
        assert(!style || style instanceof Stroke, 'Invalid stroke style')

        if (style === this._strokeStyle) return

        this._strokeStyle = style
        this._strokeStyleVm = style?.vm && style?.vm[0]

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('strokeStyle changed, scheduling recreate...')
        }

        this.scheduleRecreate()
      },
    },
  }
</script>
