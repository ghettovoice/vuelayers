<script>
  import ImageWMS from 'ol/source/ImageWMS'
  import WMSServerType from 'ol/source/WMSServerType'
  import { imageSource, withUrl, wmsSource } from '../../mixin'

  const props = {
    hidpi: {
      type: Boolean,
      default: true,
    },
    serverType: {
      type: String,
      validator: value => !value | Object.values(WMSServerType).includes(value),
    },
    imageLoadFunction: Function,
    ratio: {
      type: Number,
      default: 1.5,
    },
    resolutions: Array,
    url: {
      type: String,
      required: true,
      validator: value => !!value.length,
    },
  }

  const methods = {
    createOlObject () {
      return new ImageWMS({
        attributions: this.attributions,
        crossOrigin: this.crossOrigin,
        hidpi: this.hidpi,
        serverType: this.serverType,
        imageLoadFunction: this.imageLoadFunction,
        params: this.allParams,
        projection: this.projection,
        ratio: this.ratio,
        resolutions: this.resolutions,
        url: this.urlTmpl,
      })
    },
  }

  export default {
    name: 'vl-source-image-wms',
    mixins: [imageSource, withUrl, wmsSource],
    props,
    methods,
  }
</script>
