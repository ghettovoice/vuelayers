<script>
  import debounce from 'debounce-promise'
  import { Heatmap as HeatmapLayer } from 'ol/layer'
  import { skipWhile } from 'rxjs/operators'
  import { vectorLayer, FRAME_TIME } from '../../mixin'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import { addPrefix, isEqual } from '../../util/minilo'
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
        type: [String, Function],
        default: 'weight',
      },
    },
    computed: {
      currentBlur () {
        if (this.rev && this.$layer) {
          return this.$layer.getBlur()
        }

        return this.blur
      },
      currentGradient () {
        if (this.rev && this.$layer) {
          return this.$layer.getGradient()
        }

        return this.gradient
      },
      currentRadius () {
        if (this.rev && this.$layer) {
          return this.$layer.getRadius()
        }

        return this.radius
      },
    },
    watch: {
      async blur (value) {
        await this.setBlur(value)
      },
      currentBlur: debounce(function (value) {
        if (value === this.blur) return

        this.$emit('update:blur', value)
      }, FRAME_TIME),
      async gradient (value) {
        await this.setGradient(value)
      },
      currentGradient: {
        deep: true,
        handler: debounce(function (value) {
          if (isEqual(value, this.gradient)) return

          this.$emit('update:gradient', value.slice())
        }, FRAME_TIME),
      },
      async radius (value) {
        await this.setRadius(value)
      },
      currentRadius: debounce(function (value) {
        if (value === this.radius) return

        this.$emit('update:radius', value)
      }, FRAME_TIME),
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
          source: this.$source,
          // ol/layer/BaseVector
          renderOrder: this.currentRenderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // ol/layer/Heatmap
          blur: this.currentBlur,
          gradient: this.currentGradient,
          radius: this.currentRadius,
          weight: this.weight,
        })
      },
      subscribeAll () {
        this::vectorLayer.methods.subscribeAll()
        this::subscribeToLayerEvents()
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

  function subscribeToLayerEvents () {
    const prefixKey = addPrefix('current')
    const propChanges = obsFromOlChangeEvent(this.$layer, [
      'blur',
      'gradient',
      'radius',
    ], true, evt => ({
      ...evt,
      compareWith: this[prefixKey(evt.prop)],
    })).pipe(
      skipWhile(({ compareWith, value }) => isEqual(value, compareWith)),
    )
    this.subscribeTo(propChanges, () => {
      ++this.rev
    })
  }
</script>
