<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <FillStyle :id="'vl-' + currentId + '-default-fill-style'" />
      <StrokeStyle :id="'vl-' + currentId + '-default-stroke-style'" />
    </slot>
  </i>
</template>

<script>
  import { Circle as CircleStyle } from 'ol/style'
  import { regShapeStyle } from '../../mixins'
  import { coalesce, noop } from '../../utils'
  import FillStyle from './fill.vue'
  import StrokeStyle from './stroke.vue'

  export default {
    name: 'VlStyleCircle',
    components: {
      FillStyle,
      StrokeStyle,
    },
    mixins: [
      regShapeStyle,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      radius: {
        ...regShapeStyle.props.radius,
        default: 5,
      },
      /* eslint-enable vue/require-prop-types */
    },
    data () {
      return {
        currentRadius: this.radius,
      }
    },
    watch: {
      rev () {
        if (!this.$style) return

        this.setRadius(this.getRadius())
      },
      currentRadius (value) {
        if (value === this.radius) return

        this.$emit('update:radius', value)
      },
    },
    methods: {
      /**
       * @return {CircleStyle}
       * @protected
       */
      createStyle () {
        return new CircleStyle({
          // ol/style/Image
          displacement: this.inputDisplacement,
          // ol/style/RegularShape
          radius: this.currentRadius,
          fill: this.$fill,
          stroke: this.$stroke,
        })
      },
      /**
       * @protected
       */
      syncNonObservable () {
        this::regShapeStyle.methods.syncNonObservable()

        this.setRadius(this.getRadius())
      },
      getRadius () {
        return coalesce(this.$style?.getRadius(), this.currentRadius)
      },
      setRadius (radius) {
        if (radius !== this.currentRadius) {
          this.currentRadius = radius
          this.scheduleRefresh()
        }
        if (this.$style && radius !== this.$style.getRadius()) {
          this.$style.setRadius(radius)
          this.scheduleRefresh()
        }
      },
      /**
       * @param {number} value
       * @protected
       */
      radiusChanged (value) {
        this.setRadius(value)
      },
      pointsChanged: noop,
      radius1Changed: noop,
      radius2Changed: noop,
      angleChanged: noop,
    },
  }
</script>
