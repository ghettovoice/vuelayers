<template>
  <i
    :id="vmId"
    :class="vmClass"
    style="display: none !important;">
    <slot>
      <VlStyleFill />
      <VlStyleStroke />
    </slot>
  </i>
</template>

<script>
  import { Circle as CircleStyle } from 'ol/style'
  import { regShapeStyle } from '../../mixin'
  import { omit } from '../../util/minilo'
  import { Style as VlStyleFill } from '../fill-style'
  import { Style as VlStyleStroke } from '../stroke-style'

  export default {
    name: 'VlStyleCircle',
    components: {
      VlStyleFill,
      VlStyleStroke,
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
