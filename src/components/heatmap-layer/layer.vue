<script>
  import { Heatmap as HeatmapLayer } from 'ol/layer'
  import { makeChangeOrRecreateWatchers, vectorLayer } from '../../mixins'
  import { fromOlChangeEvent as obsFromOlChangeEvent } from '../../rx-ext'
  import { addPrefix, assert, coalesce, isArray, isEqual, isNumber } from '../../utils'

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
    data () {
      return {
        currentGradient: this.gradient.slice(),
        currentRadius: this.radius,
        currentBlur: this.blur,
      }
    },
    computed: {
      inputGradient () {
        return this.gradient.slice()
      },
    },
    watch: {
      rev () {
        if (!this.$layer) return

        if (!isEqual(this.currentGradient, this.$layer.getGradient())) {
          this.currentGradient = this.$layer.getGradient()
        }
        if (this.currentRadius !== this.$layer.getRadius()) {
          this.currentRadius = this.$layer.getRadius()
        }
        if (this.currentBlur !== this.$layer.getBlur()) {
          this.currentBlur = this.$layer.getBlur()
        }
      },
      inputGradient (value) {
        this.setGradient(value)
      },
      currentGradient: {
        deep: true,
        handler (value) {
          if (isEqual(value, this.inputGradient)) return

          this.$emit('update:gradient', value.slice())
        },
      },
      radius (value) {
        this.setRadius(value)
      },
      currentRadius (value) {
        if (value === this.radius) return

        this.$emit('update:radius', value)
      },
      blur (value) {
        this.setBlur(value)
      },
      currentBlur (value) {
        if (value === this.blur) return

        this.$emit('update:blur', value)
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'weight',
      ]),
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
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          style: this.$style,
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
      getBlur () {
        return coalesce(this.$layer?.getBlur(), this.currentBlur)
      },
      setBlur (blur) {
        blur = Number(blur)
        assert(isNumber(blur), 'Invalid blur')

        if (blur !== this.currentBlur) {
          this.currentBlur = blur
        }
        if (this.$layer && blur !== this.$layer.getBlur()) {
          this.$layer.setBlur(blur)
        }
      },
      getGradient () {
        return coalesce(this.$layer?.getGradient(), this.currentGradient)
      },
      setGradient (gradient) {
        assert(isArray(gradient), 'Invalid gradient')
        gradient = gradient.slice()

        if (!isEqual(gradient, this.currentGradient)) {
          this.currentGradient = gradient
        }
        if (this.$layer && !isEqual(gradient, this.$layer.getGradient())) {
          this.$layer.setGradient(gradient)
        }
      },
      getRadius () {
        return coalesce(this.$layer?.getRadius(), this.currentRadius)
      },
      setRadius (radius) {
        radius = Number(radius)
        assert(isNumber(radius), 'Invalid radius')

        if (radius !== this.currentRadius) {
          this.currentRadius = radius
        }
        if (this.$layer && radius !== this.$layer.getRadius()) {
          this.$layer.setRadius(radius)
        }
      },
    },
  }

  function subscribeToLayerEvents () {
    const setterKey = addPrefix('set')
    const propChanges = obsFromOlChangeEvent(this.$layer, [
      'blur',
      'gradient',
      'radius',
    ], true, evt => ({
      ...evt,
      setter: this[setterKey(evt.prop)],
    }))
    this.subscribeTo(propChanges, ({ setter, value }) => setter(value))
  }
</script>
