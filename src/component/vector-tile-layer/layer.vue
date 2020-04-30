<script>
  import { VectorTile as VectorTileLayer } from 'ol/layer'
  import RenderType from 'ol/layer/VectorTileRenderType'
  import { makeWatchers } from 'util/vue-helpers'
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
        default: RenderType.HYBRID,
        validator: val => Object.values(RenderType).includes(val),
      },
    },
    watch: {
      ...makeWatchers([
        'renderMode',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    methods: {
      /**
       * @return {VectorTileLayer}
       * @protected
       */
      createLayer () {
        return new VectorTileLayer({
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
          // ol/layer/VectorTile
          // tile layer props
          preload: this.preload,
          useInterimTilesOnError: this.useInterimTilesOnError,
          // vector tile props
          renderMode: this.renderMode,
        })
      },
    },
  }
</script>
