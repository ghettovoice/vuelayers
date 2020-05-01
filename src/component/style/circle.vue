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
  import { omit } from '../../util/minilo'
  import FillStyle from './fill.vue'
  import StrokeStyle from './stroke.vue'

  export default {
    name: 'VlStyleCircle',
    components: {
      FillStyle,
      StrokeStyle,
    },
    mixins: [
      {
        ...regShapeStyle,
        watch: omit(regShapeStyle.watch, ['radius']),
      },
    ],
    props: {
      radius: {
        type: Number,
        default: 5,
      },
    },
    watch: {
      async radius (value) {
        await this.setRadius(value)
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
        const style = await this.resolveStyle()

        if (radius === style.getRadius()) return

        style.setRadius(radius)

        await this.scheduleRemount()
      },
    },
  }
</script>
