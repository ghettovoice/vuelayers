<script>
  import { MapboxVector as MapboxVectorLayer } from 'ol/layer'
  import { makeChangeOrRecreateWatchers, vectorLayer } from '../../mixins'
  import { isArray, isString } from '../../utils'
  import { Layer } from '../vector-tile-layer'

  export default {
    name: 'VlLayerMapboxVector',
    extends: Layer,
    props: {
      styleUrl: {
        type: String,
        required: true,
      },
      accessToken: {
        type: String,
        required: true,
      },
      sourceId: String,
      layerIds: {
        type: Array,
        validate: val => isArray(val) && val.every(isString),
      },
      // eslint-disable-next-line vue/require-prop-types
      declutter: {
        ...vectorLayer.props.declutter,
        default: true,
      },
    },
    watch: {
      /*#__PURE__*/...makeChangeOrRecreateWatchers([
        'styleUrl',
        'accessToken',
        'sourceId',
        'layerIds',
      ], [
        'layerIds',
      ]),
    },
    methods: {
      /**
       * @returns {HeatmapLayer}
       */
      createLayer () {
        return new MapboxVectorLayer({
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
          // ol/layer/BaseVector
          renderOrder: this.renderOrder,
          renderBuffer: this.renderBuffer,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          // ol/layer/Tile
          preload: this.currentPreload,
          useInterimTilesOnError: this.currentUseInterimTilesOnError,
          // ol/layer/MapboxVector
          styleUrl: this.styleUrl,
          accessToken: this.accessToken,
          source: this.sourceId,
          layers: this.layerIds,
        })
      },
    },
  }
</script>
