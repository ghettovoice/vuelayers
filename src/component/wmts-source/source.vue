<script>
  import WMTSSource from 'ol/source/WMTS'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { tileSource } from '../../mixin'
  import {
    createExtentFromProjection,
    EXTENT_CORNER,
    getExtentCorner,
    resolutionsFromExtent,
    WMTS_FORMAT,
    WMTS_REQUEST_ENCODING,
    WMTS_VERSION,
  } from '../../ol-ext'
  import { range } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

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
      matrixIds: {
        type: Array,
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
      createTileGrid () {
        let extent = createExtentFromProjection(this.projection)
        let resolutions = this.resolutions ? this.resolutions : resolutionsFromExtent(extent, this.maxZoom, this.tileSize)
        let origin = this.origin ? this.origin : getExtentCorner(extent, EXTENT_CORNER.TOP_LEFT)
        let matrixIds = this.matrixIds || Array.from(range(this.minZoom, resolutions.length))

        return new WMTSTileGrid({
          extent,
          origin,
          resolutions,
          tileSize: this.tileSize,
          minZoom: this.minZoom,
          matrixIds,
        })
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
