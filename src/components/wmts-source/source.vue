<script>
  import { getHeight as getExtentHeight, getWidth as getExtentWidth } from 'ol/extent'
  import ExtentCorner from 'ol/extent/Corner'
  import { toSize } from 'ol/size'
  import { WMTS as WMTSSource } from 'ol/source'
  import { DEFAULT_MAX_ZOOM, DEFAULT_TILE_SIZE } from 'ol/tilegrid/common'
  import WMTSTileGrid from 'ol/tilegrid/WMTS'
  import { makeChangeOrRecreateWatchers, tileImageSource } from '../../mixins'
  import { extentFromProjection, getCorner as getExtentCorner, roundExtent, roundPointCoords } from '../../ol-ext'
  import { coalesce, isArray, isFunction, isNumber, noop, range } from '../../utils'

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
      inputTileSize () {
        return isArray(this.tileSize) ? this.tileSize : [this.tileSize, this.tileSize]
      },
      derivedTileGridFactory () {
        if (isFunction(this.tileGridFactory)) {
          return this.tileGridFactory
        }

        const extent = this.extentDataProj || extentFromProjection(this.resolvedDataProjection)
        const resolutions = this.resolutions || resolutionsFromExtent(extent, this.maxZoom, this.inputTileSize)
        const origin = this.originDataProj || getExtentCorner(extent, ExtentCorner.TOP_LEFT)
        const matrixIds = this.matrixIds || range(this.minZoom, resolutions.length)
        const tileSize = this.inputTileSize
        const minZoom = this.minZoom

        return () => (new WMTSTileGrid({ extent, origin, resolutions, minZoom, matrixIds, tileSize }))
      },
      inputTileUrlFunction: noop,
    },
    watch: {
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'dimensions',
        'format',
        'layerName',
        'styleName',
        'matrixSet',
        'requestEncoding',
        'version',
      ], [
        'dimensions',
      ]),
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
          urls: this.currentUrls,
          tileLoadFunction: this.currentTileLoadFunction,
          // ol/source/TileImage
          crossOrigin: this.crossOrigin,
          reprojectionErrorThreshold: this.reprojectionErrorThreshold,
          tileClass: this.tileClass,
          imageSmoothing: this.imageSmoothing,
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
      getDimensions () {
        return coalesce(this.$source?.getDimensions(), this.dimensions)
      },
      getFormat () {
        return coalesce(this.$source?.getFormat(), this.format)
      },
      getLayer () {
        return coalesce(this.$source?.getLayer(), this.layerName)
      },
      getMatrixSet () {
        return coalesce(this.$source?.getMatrixSet(), this.matrixSet)
      },
      getRequestEncoding () {
        return coalesce(this.$source?.getRequestEncoding(), this.requestEncoding)
      },
      getStyle () {
        return coalesce(this.$source?.getStyle(), this.styleName)
      },
      getVersion () {
        return coalesce(this.$source?.getVersion(), this.version)
      },
      attributionsCollapsibleChanged: noop,
      stateChanged: noop,
      tileKeyChanged: noop,
      opaqueChanged: noop,
      zDirectionChanged: noop,
      inputTileUrlFunctionChanged: noop,
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
