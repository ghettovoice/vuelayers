<script>
  import WMTSSource from 'ol/source/wmts'
  import { consts } from '../../../ol'
  import tileSource from '../tile'

  const { WMTS_VERSION, WMTS_REQUEST_ENCODING, WMTS_FORMAT } = consts

  const props = {
    layer: {
      type: String,
      required: true
    },
    style: {
      type: String,
      required: true
    },
    matrixSet: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: WMTS_VERSION
    },
    requestEncoding: {
      type: String,
      default: WMTS_REQUEST_ENCODING
    },
    format: {
      type: String,
      default: WMTS_FORMAT
    },
    dimensions: Object
  }

  const computed = {
    currentLayer () {
      return this.layer
    },
    currentVersion () {
      return this.version
    },
    currentStyle () {
      return this.style
    },
    currentMatrixSet () {
      return this.matrixSet
    },
    currentRequestEncoding () {
      return this.requestEncoding
    },
    currentFormat () {
      return this.format
    }
  }

  const methods = {
    createSource () {
      return new WMTSSource({
        attributions: this.currentAttributions,
        cacheSize: this.cacheSize
      })
    }
  }

  const watch = {
  }

  export default {
    name: 'vl-source-wmts',
    mixins: [ tileSource ],
    props,
    computed,
    methods,
    watch
  }
</script>
