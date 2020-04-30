<script>
  import { Heatmap as HeatmapLayer } from 'ol/layer'
  import { vectorLayer } from '../../mixin'
  import { isEqual } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlLayerHeatmap',
    mixins: [
      vectorLayer,
    ],
    props: {
      /**
       * @type {string[]}
       */
      gradient: {
        type: Array,
        default: () => ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
      },
      /**
       * @type {number}
       */
      radius: {
        type: Number,
        default: 8,
      },
      /**
       * @type {number}
       */
      blur: {
        type: Number,
        default: 15,
      },
      /**
       * @type {string}
       */
      weight: {
        type: String,
        default: 'weight',
      },
    },
    watch: {
      async blur (value) {
        await this.setBlur(value)
      },
      async gradient (value) {
        await this.setGradient(value)
      },
      async radius (value) {
        await this.setRadius(value)
      },
      ...makeWatchers([
        'weight',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @returns {HeatmapLayer}
       */
      createLayer () {
        return new HeatmapLayer({
          // ol/layer/Base
          className: this.className,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          source: this.$source,
          // ol/layer/Layer
          render: this.render,
          // ol/layer/BaseVector
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // ol/layer/Heatmap
          blur: this.blur,
          gradient: this.gradient,
          radius: this.radius,
          weight: this.weight,
        })
      },
      async getBlur () {
        return (await this.resolveLayer()).getBlur()
      },
      async setBlur (blur) {
        const layer = await this.resolveLayer()

        if (blur === layer.getBlur()) return

        layer.setBlur(blur)
      },
      async getGradient () {
        return (await this.resolveLayer()).getGradient()
      },
      async setGradient (gradient) {
        const layer = await this.resolveLayer()

        if (isEqual(gradient, layer.getGradient())) return

        layer.setGradient(gradient)
      },
      async getRadius () {
        return (await this.resolveLayer()).getRadius()
      },
      async setRadius (radius) {
        const layer = await this.resolveLayer()

        if (radius === layer.getRadius()) return

        layer.setRadius(radius)
      },
    },
  }
</script>
