<script>
  import { VectorTile as VectorTileLayer } from 'ol/layer'
  import RenderType from 'ol/layer/VectorTileRenderType'
  import { makeChangeOrRecreateWatchers, tileLayer, vectorLayer } from '../../mixins'

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
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'renderMode',
      ]),
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
          // ol/layer/VectorTile
          // tile layer props
          preload: this.currentPreload,
          useInterimTilesOnError: this.currentUseInterimTilesOnError,
          // vector tile props
          renderMode: this.renderMode,
        })
      },
    },
  }
</script>
