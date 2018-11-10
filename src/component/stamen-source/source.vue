<script>
  import StamenSource from 'ol/source/Stamen'
  import xyzSource from '../../mixin/xyz-source'

  const props = {
    /**
     * Stamen layer name
     *
     * @type {string}
     */
    layer: {
      type: String,
      required: true,
    },
    /**
     * If nothing provided then default url resolved
     * with current layer params will be used.
     * @see {ol.source.Stamen}
     *
     * @type {string}
     */
    url: String,
  }

  const methods = {
    createSource () {
      return new StamenSource({
        cacheSize: this.cacheSize,
        layer: this.layer,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        opaque: this.opaque,
        reprojectionErrorThreshold: this.reprojectionErrorThreshold,
        tileLoadFunction: this.tileLoadFunction,
        url: this.urlTmpl || undefined,
        wrapX: this.wrapX,
      })
    },
  }

  export default {
    name: 'vl-source-stamen',
    mixins: [xyzSource],
    props,
    methods,
  }
</script>
