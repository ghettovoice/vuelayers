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
      blur (value) {
        this.setBlur(value)
      },
      gradient (value) {
        this.setGradient(value)
      },
      radius (value) {
        this.setRadius(value)
      },
      ...makeWatchers([
        'weight',
      ], () => vectorLayer.methods.scheduleRecreate),
    },
    methods: {
      /**
       * @returns {module:ol/layer/Heatmap~Heatmap}
       */
      createLayer () {
        return new HeatmapLayer({
          // layer props
          id: this.id,
          className: this.className,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          render: this.render,
          // vector layer props
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // self props
          blur: this.blur,
          gradient: this.gradient,
          radius: this.radius,
          weight: this.weight,
        })
      },
      async getLayerBlur () {
        return (await this.resolveLayer()).getBlur()
      },
      async setLayerBlur (blur) {
        const layer = await this.resolveLayer()

        if (blur === layer.getBlur()) return

        layer.setBlur(blur)
      },
      async getLayerGradient () {
        return (await this.resolveLayer()).getGradient()
      },
      async setLayerGradient (gradient) {
        const layer = await this.resolveLayer()

        if (isEqual(gradient, layer.getGradient())) return

        layer.setGradient(gradient)
      },
      async getLayerRadius () {
        return (await this.resolveLayer()).getRadius()
      },
      async setLayerRadius (radius) {
        const layer = await this.resolveLayer()

        if (radius === layer.getRadius()) return

        layer.setRadius(radius)
      },
    },
  }
</script>
