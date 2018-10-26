<script>
  import TileWMSSource from 'ol/source/TileWMS'
  import WMSServerType from 'ol/source/WMSServerType'
  import { tileSource, wmsSource } from '../../mixin'

  const props = {
    gutter: Number,
    hidpi: {
      type: Boolean,
      default: true,
    },
    serverType: {
      type: String,
      validator: value => !value | Object.values(WMSServerType).includes(value),
    },
    url: {
      type: String,
      required: true,
      validator: value => !!value.length,
    },
  }

  const methods = {
    /**
     * @returns {TileWMS}
     * @protected
     */
    createSource () {
      return new TileWMSSource({
        attributions: this.attributions,
        cacheSize: this.cacheSize,
        params: this.allParams,
        crossOrigin: this.crossOrigin,
        gutter: this.gutter,
        hidpi: this.hidpi,
        logo: this.logo,
        tileGrid: this._tileGrid,
        projection: this.projection,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        serverType: this.serverType,
        wrapX: this.wrapX,
        url: this.urlTmpl,
        transition: this.transition,
        tileLoadFunction: this.tileLoadFunction,
      })
    },
  }

  export default {
    name: 'vl-source-wms',
    mixins: [tileSource, wmsSource],
    props,
    methods,
  }
</script>
