<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <FillStyle />
      <StrokeStyle />
    </slot>
  </i>
</template>

<script>
  import { Circle as CircleStyle } from 'ol/style'
  import { regShapeStyle } from '../../mixin'
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
      radius: {
        type: Number,
        default: 5,
      },
    },
    methods: {
      /**
       * @return {CircleStyle}
       * @protected
       */
      createStyle () {
        return new CircleStyle({
          radius: this.radius,
          displacement: this.displacement,
          fill: this.$fill,
          stroke: this.$stroke,
        })
      },
      async setRadius (radius) {
        if (radius === await this.getRadius()) return

        (await this.resolveStyle()).setRadius(radius)

        await this.scheduleRemount()
      },
      async onRadiusChanged (radius) {
        await this.setRadius(radius)
      },
    },
  }
</script>
