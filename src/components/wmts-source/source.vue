<script>
  import { getHeight as getExtentHeight, getWidth as getExtentWidth } from 'ol/extent'
  import ExtentCorner from 'ol/extent/Corner'
  import { toSize } from 'ol/size'
  import { WMTS as WMTSSource } from 'ol/source'
  import { DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE } from 'ol/tilegrid/common'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { tileImageSource } from '../../mixins'
  import { roundExtent, roundPointCoords, extentFromProjection, getCorner as getExtentCorner } from '../../ol-ext'
  import { isArray, isEqual, isFunction, isNumber, range } from '../../utils'

  export default {
    name: 'VlSourceWmts',
    mixins: [
      tileImageSource,
    ],
    props: {
      // ol/source/WMTS
      layerName: {
        type: String,
        required: true,
      },
      styleName: {
        type: String,
        required: true,
      },
      matrixSet: {
        type: String,
        required: true,
      },
      dimensions: Object,
      format: {
        type: String,
        default: 'image/jpeg',
      },
      requestEncoding: {
        type: String,
        default: 'KVP',
      },
      version: {
        type: String,
        default: '1.0.0',
      },
      // custom
      extent: {
        type: Array,
        validator: value => value.length === 4 && value.every(isNumber),
      },
      resolutions: {
        type: Array,
        validator: value => value.every(isNumber),
      },
      origin: {
        type: Array,
        validator: value => value.length === 2 && value.every(isNumber),
      },
      matrixIds: {
        type: Array,
        validator: value => value.every(isNumber),
      },
      maxZoom: {
        type: Number,
        default: DEFAULT_MAX_ZOOM,
      },
      minZoom: {
        type: Number,
        default: 0,
      },
      tileSize: {
        type: [Number, Array],
        default: () => [DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE],
      },
    },
    computed: {
      extentDataProj () {
        return roundExtent(this.extent)
      },
      extentViewProj () {
        return this.extentToViewProj(this.extent)
      },
      originDataProj () {
        return roundPointCoords(this.origin)
      },
      originViewProj () {
        return this.pointToViewProj(this.origin)
      },
      tileSizeArr () {
        return isArray(this.tileSize) ? this.tileSize : [this.tileSize, this.tileSize]
      },
      derivedTileGridFactory () {
        if (isFunction(this.tileGridFactory)) {
          return this.tileGridFactory
        }

        const extent = this.extentDataProj || extentFromProjection(this.resolvedDataProjection)
        const resolutions = this.resolutions || resolutionsFromExtent(extent, this.maxZoom, this.tileSizeArr)
        const origin = this.originDataProj || getExtentCorner(extent, ExtentCorner.TOP_LEFT)
        const matrixIds = this.matrixIds || range(this.minZoom, resolutions.length)
        const tileSize = this.tileSizeArr
        const minZoom = this.minZoom

        return () => (new WMTSTileGrid({ extent, origin, resolutions, minZoom, matrixIds, tileSize }))
      },
    },
    watch: {
      async dimensions (value) {
        if (isEqual(value, await this.getDimensions())) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('dimensions changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async format (value) {
        if (value === await this.getFormat()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('format changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async layer (value) {
        if (value === await this.getLayer()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('layer changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async matrixSet (value) {
        if (value === await this.getMatrixSet()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('matrixSet changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async requestEncoding (value) {
        if (value === await this.getRequestEncoding()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('requestEncoding changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async style (value) {
        if (value === await this.getStyle()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('style changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async version (value) {
        if (value === await this.getVersion()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('version changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
    },
    methods: {
      /**
       * @returns {WMTS}
       * @protected
       */
      createSource () {
        return new WMTSSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          projection: this.resolvedDataProjection,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          tileGrid: this.tileGrid,
          tilePixelRatio: this.tilePixelRatio,
          transition: this.transition,
          // ol/source/UrlTile
          urls: this.expandedUrls,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          // ol/source/WMTS
          dimensions: this.dimensions,
          format: this.format,
          layer: this.layerName,
          style: this.styleName,
          matrixSet: this.matrixSet,
          requestEncoding: this.requestEncoding,
          version: this.version,
        })
      },
      async getDimensions () {
        return (await this.resolveSource()).getDimensions()
      },
      async getFormat () {
        return (await this.resolveSource()).getFormat()
      },
      async getLayer () {
        return (await this.resolveSource()).getLayer()
      },
      async getMatrixSet () {
        return (await this.resolveSource()).getMatrixSet()
      },
      async getRequestEncoding () {
        return (await this.resolveSource()).getRequestEncoding()
      },
      async getStyle () {
        return (await this.resolveSource()).getStyle()
      },
      async getVersion () {
        return (await this.resolveSource()).getVersion()
      },
      async onExpandedUrlsChanged (urls) {
        await this.setUrls(urls)
      },
      async onTileUrlFuncChanged (tileUrlFunc) {},
    },
  }

  function resolutionsFromExtent (extent, maxZoom, tileSize, maxResolution) {
    maxZoom = maxZoom !== undefined ? maxZoom : DEFAULT_MAX_ZOOM

    const height = getExtentHeight(extent)
    const width = getExtentWidth(extent)

    tileSize = toSize(tileSize !== undefined ? tileSize : DEFAULT_TILE_SIZE)
    maxResolution = maxResolution > 0
      ? maxResolution
      : Math.max(width / tileSize[0], height / tileSize[1])

    const length = maxZoom + 1
    const resolutions = new Array(length)
    for (let z = 0; z < length; ++z) {
      resolutions[z] = maxResolution / Math.pow(2, z)
    }

    return resolutions
  }
</script>
