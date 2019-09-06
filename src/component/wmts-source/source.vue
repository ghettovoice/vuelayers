<script>
  import WMTSSource from 'ol/source/WMTS'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { makeWatchers } from '../../util/vue-helpers'
  import tileSource from '../../mixin/tile-source'
  import { EXTENT_CORNER, WMTS_FORMAT, WMTS_REQUEST_ENCODING, WMTS_VERSION } from '../../ol-ext/consts'
  import { createExtentFromProjection, getExtentCorner } from '../../ol-ext/extent'
  import { resolutionsFromExtent } from '../../ol-ext/tile-grid'
  import { range } from '../../util/minilo'

  export default {
    name: 'vl-source-wmts',
    mixins: [tileSource],
    props: {
      dimensions: Object,
      format: {
        type: String,
        default: WMTS_FORMAT,
      },
      layerName: {
        type: String,
        required: true,
      },
      matrixSet: {
        type: String,
        required: true,
      },
      requestEncoding: {
        type: String,
        default: WMTS_REQUEST_ENCODING,
      },
      styleName: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        default: WMTS_VERSION,
      },
      url: {
        type: String,
        required: true,
      },
      origin: {
        type: Array,
      },
      resolutions: {
        type: Array,
      },
    },
    methods: {
      /**
       * @returns {WMTS}
       * @protected
       */
      createSource () {
        return new WMTSSource({
          attributions: this.attributions,
          cacheSize: this.cacheSize,
          crossOrigin: this.crossOrigin,
          dimensions: this.dimensions,
          format: this.format,
          layer: this.layerName,
          logo: this.logo,
          matrixSet: this.matrixSet,
          origin: this.origin,
          projection: this.projection,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          requestEncoding: this.requestEncoding,
          resolutions: this.resolutions,
          tileGrid: this._tileGrid,
          tilePixelRatio: this.tilePixelRatio,
          style: this.styleName,
          version: this.version,
          url: this.urlTmpl,
          wrapX: this.wrapX,
          transition: this.transition,
          tileLoadFunction: this.tileLoadFunction,
        })
      },
      /**
       * @return {Promise}
       * @protected
       */
      init () {
        let extent = createExtentFromProjection(this.projection)
        let resolutions = this.resolutions ? this.resolutions : resolutionsFromExtent(extent, this.maxZoom, this.tileSize)
        let origin = this.origin ? this.origin : getExtentCorner(extent, EXTENT_CORNER.TOP_LEFT)
        let matrixIds = Array.from(range(this.minZoom, resolutions.length))
        /**
         * @type {module:ol/Tile~UrlFunction}
         * @protected
         */
        this._tileGrid = new WMTSTileGrid({
          extent,
          origin,
          resolutions,
          tileSize: this.tileSize,
          minZoom: this.minZoom,
          matrixIds,
        })

        return this::tileSource.methods.init()
      },
    },
    watch: {
      ...makeWatchers([
        'dimensions',
        'format',
        'layerName',
        'matrixSet',
        'requestEncoding',
        'styleName',
        'version',
        'resolutions',
        'origin',
      ], () => function () {
        this.scheduleRecreate()
      }),
    },
  }
</script>
