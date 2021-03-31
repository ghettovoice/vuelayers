<script>
  import { Feature } from 'ol'
  import { createTileUrlFunctionFromTemplates } from 'ol-tilecache'
  import { VectorTile as VectorTileSource } from 'ol/source'
  import TileEventType from 'ol/source/TileEventType'
  import { createXYZ } from 'ol/tilegrid'
  import { featureHelper, makeChangeOrRecreateWatchers, tileSource, urlTileSource } from '../../mixins'
  import { createMvtFmt, extentFromProjection, roundExtent } from '../../ol-ext'
  import { fromOlEvent as obsFromOlEvent } from '../../rx-ext'
  import { and, coalesce, forEach, isArray, isFunction, isNumber, noop, or, sealFactory } from '../../utils'

  const validateTileSize = /*#__PURE__*/or(isNumber, and(isArray, value => value.length === 2 && value.every(isNumber)))

  export default {
    name: 'VlSourceVectorTile',
    mixins: [
      urlTileSource,
      featureHelper,
    ],
    props: {
      /* eslint-disable vue/require-prop-types */
      // ol/source/Tile
      cacheSize: {
        ...tileSource.props.cacheSize,
        default: 128,
      },
      zDirection: {
        ...tileSource.props.zDirection,
        default: 1,
      },
      /* eslint-enable vue/require-prop-types */
      // ol/source/VectorTile
      extent: {
        type: Array,
        validator: value => value.length === 4 && value.every(isNumber),
      },
      formatFactory: {
        type: Function,
        default: createMvtFmt,
      },
      overlaps: {
        type: Boolean,
        default: true,
      },
      tileClass: Function,
      maxZoom: {
        type: Number,
        default: 22,
      },
      minZoom: {
        type: Number,
        default: 0,
        validator: value => value >= 0,
      },
      maxResolution: Number,
      tileSize: {
        type: [Number, Array],
        default: () => [512, 512],
        validator: validateTileSize,
      },
    },
    data () {
      return {
        format: undefined,
      }
    },
    computed: {
      inputTileSize () {
        return isArray(this.tileSize) ? this.tileSize : [this.tileSize, this.tileSize]
      },
      derivedTileGridFactory () {
        if (isFunction(this.tileGridFactory)) {
          return this.tileGridFactory
        }

        const extent = this.extentDataProj || extentFromProjection(this.resolvedDataProjection)
        const maxZoom = this.maxZoom
        const minZoom = this.minZoom
        const maxResolution = this.maxResolution
        const tileSize = this.inputTileSize

        return () => createXYZ({ extent, maxZoom, minZoom, maxResolution, tileSize })
      },
      extentDataProj () {
        return roundExtent(this.extent)
      },
      extentViewProj () {
        return this.extentToViewProj(this.extent)
      },
      formatIdent () {
        if (!this.olObjIdent) return

        return this.makeIdent(this.olObjIdent, 'format')
      },
      inputFormatFactory () {
        return sealFactory(::this.formatFactory)
      },
      inputTileUrlFunction () {
        const urlFunc = coalesce(this.tileUrlFunction, this.tileUrlFunc)
        if (isFunction(urlFunc)) return urlFunc
        if (this.currentUrls.length === 0) return

        return createTileUrlFunctionFromTemplates(this.currentUrls, this.tileGrid)
      },
    },
    watch: {
      formatIdent (value, prevValue) {
        if (value && prevValue) {
          this.moveInstance(value, prevValue)
        } else if (value && !prevValue && this.format) {
          this.setInstance(value, this.format)
        } else if (!value && prevValue) {
          this.unsetInstance(prevValue)
        }
      },
      inputFormatFactory (value) {
        while (this.hasInstance(this.formatIdent)) {
          this.unsetInstance(this.formatIdent)
        }

        if (isFunction(value)) {
          this.format = this.instanceFactoryCall(this.formatIdent, this::value)
        } else {
          this.format = undefined
        }
      },
      .../*#__PURE__*/makeChangeOrRecreateWatchers([
        'extentViewProj',
        'overlaps',
        'tileClass',
      ], [
        'extentViewProj',
      ]),
    },
    created () {
      if (isFunction(this.inputFormatFactory)) {
        this.format = this.instanceFactoryCall(this.formatIdent, ::this.inputFormatFactory)
      }
    },
    methods: {
      /**
       * @return {VectorTileSource}
       */
      createSource () {
        return new VectorTileSource({
          // ol/source/Source
          attributions: this.currentAttributions,
          attributionsCollapsible: this.attributionsCollapsible,
          projection: this.resolvedDataProjection,
          state: this.currentState,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          tileGrid: this.tileGrid,
          transition: this.transition,
          zDirection: this.zDirection,
          // ol/source/UrlTile
          tileLoadFunction: this.currentTileLoadFunction,
          tileUrlFunction: this.currentTileUrlFunction,
          // ol/source/VectorTile
          format: this.format,
          extent: this.extentViewProj,
          overlaps: this.overlaps,
          tileClass: this.tileClass,
        })
      },
      /**
       * @returns {void}
       */
      subscribeAll () {
        this::urlTileSource.methods.subscribeAll()
        this::subscribeToSourceEvents()
      },
      async getFeaturesInExtent (extent, viewProj = false) {
        extent = viewProj ? roundExtent(extent) : this.extentToViewProj(extent)

        return (await this.resolveSource()).getFeaturesInExtent(extent)
      },
      async clear () {
        (await this.resolveSource()).clear()
      },
      tileKeyChanged: noop,
      opaqueChanged: noop,
      tilePixelRatioChanged: noop,
    },
  }

  function subscribeToSourceEvents () {
    this.subscribeTo(obsFromOlEvent(this.$source, TileEventType.TILELOADEND), evt => {
      if (!evt.tile) return

      forEach(evt.tile.getFeatures(), feature => {
        if (!(feature instanceof Feature)) return
        this.initializeFeature(feature)
      })
    })
  }
</script>
