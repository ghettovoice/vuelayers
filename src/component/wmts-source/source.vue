<script>
  import WMTSSource from 'ol/source/WMTS'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { tileSource } from '../../mixin'
  import {
    createExtentFromProjection,
    EXTENT_CORNER,
    getExtentCorner,
    resolutionsFromExtent,
  } from '../../ol-ext'
  import { range } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlSourceWmts',
    mixins: [tileSource],
    props: {
      dimensions: Object,
      format: {
        type: String,
        default: 'image/jpeg',
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
        default: 'KVP',
      },
      styleName: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        default: '1.0.0',
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
        const extent = createExtentFromProjection(this.projection)
        const resolutions = this.resolutions ? this.resolutions : resolutionsFromExtent(extent, this.maxZoom, this.tileSize)
        const origin = this.origin ? this.origin : getExtentCorner(extent, EXTENT_CORNER.TOP_LEFT)
        const matrixIds = Array.from(range(this.minZoom, resolutions.length))
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
  }
</script>
