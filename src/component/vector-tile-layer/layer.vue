<script>
  import { VectorTile as VectorTileLayer } from 'ol/layer'
  import { tileLayer, vectorLayer } from '../../mixin'

  export default {
    name: 'VlLayerVectorTile',
    mixins: [
      tileLayer,
      vectorLayer,
    ],
    props: {
      renderMode: {
        type: String,
        default: 'hybrid',
        validator: val => [
          'image',
          'hybrid',
        ].includes(val),
      },
    },
    methods: {
      /**
       * @return {module:ol/layer/VectorTile~VectorTileLayer}
       * @protected
       */
      createLayer () {
        return new VectorTileLayer({
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
          // tile layer props
          preload: this.preload,
          useInterimTilesOnError: this.useInterimTilesOnError,
          // vector tile props
          renderMode: this.renderMode,
          // instance props
          source: this.$source,
        })
      },
    },
  }
</script>
