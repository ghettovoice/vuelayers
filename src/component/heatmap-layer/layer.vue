<script>
  import HeatmapLayer from 'ol/layer/Heatmap'
  import { isEqual } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'
  import { vectorLayer } from '../../mixin'

  export default {
    name: 'vl-layer-heatmap',
    mixins: [vectorLayer],
    props: {
      gradient: {
        type: Array,
        default: () => ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#f00'],
      },
      radius: {
        type: Number,
        default: 8,
      },
      blur: {
        type: Number,
        default: 15,
      },
      shadow: {
        type: Number,
        default: 250,
      },
      weight: {
        type: String,
        default: 'weight',
      },
    },
    methods: {
      createLayer () {
        return new HeatmapLayer({
          id: this.id,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          renderMode: this.renderMode,
          gradient: this.gradient,
          radius: this.radius,
          blur: this.blur,
          shadow: this.shadow,
          weight: this.weight,
        })
      },
    },
    watch: {
      blur (value) {
        if (!this.$layer || this.$layer.getBlur() === value) return

        this.$layer.setBlur(value)
      },
      gradient (value) {
        if (!this.$layer || isEqual(this.$layer.getGradient(), value)) return

        this.$layer.setGradient(value)
      },
      radius (value) {
        if (!this.$layer || this.$layer.getRadius() === value) return

        this.$layer.setRadius(value)
      },
      ...makeWatchers([
        'shadow',
        'weight',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }
</script>
