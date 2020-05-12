<script>
  import VectorTileSource from 'ol/source/VectorTile'
  import { createXYZ, extentFromProjection } from 'ol/tilegrid'
  import { urlTileSource } from '../../mixin'
  import { createMvtFmt, roundExtent } from '../../ol-ext'
  import { isArray, isFunction, isNumber, sealFactory } from '../../util/minilo'
  import { makeWatchers } from '../../util/vue-helpers'

  export default {
    name: 'VlSourceVectorTile',
    mixins: [
      urlTileSource,
    ],
    props: {
      // ol/source/Tile
      cacheSize: {
        type: Number,
        default: 128,
      },
      zDirection: {
        type: Number,
        default: 1,
      },
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
        validator: value => isNumber(value) ||
          (isArray(value) && value.length === 2 && value.every(isNumber)),
      },
    },
    data () {
      return {
        format: null,
      }
    },
    computed: {
      tileSizeArr () {
        return isArray(this.tileSize) ? this.tileSize : [this.tileSize, this.tileSize]
      },
      derivedTileGridFactory () {
        if (isFunction(this.tileGridFactory)) {
          return this.tileGridFactory
        }

        const projection = this.projection
        const maxZoom = this.maxZoom
        const minZoom = this.minZoom
        const maxResolution = this.maxResolution
        const tileSize = this.tileSizeArr

        return () => createXYZ({
          extent: extentFromProjection(projection),
          maxZoom: maxZoom,
          minZoom: minZoom,
          maxResolution: maxResolution,
          tileSize: tileSize,
        })
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
      sealFormatFactory () {
        return sealFactory(::this.formatFactory)
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
      async sealFormatFactory (value) {
        while (this.hasInstance(this.formatIdent)) {
          this.unsetInstance(this.formatIdent)
        }

        if (isFunction(value)) {
          this.format = this.instanceFactoryCall(this.formatIdent, this::value)
        } else {
          this.format = undefined
        }

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('sealDataFormatFactory changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      async overlaps (value) {
        if (value === await this.getOverlaps()) return

        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log('overlaps changed, scheduling recreate...')
        }

        await this.scheduleRecreate()
      },
      ...makeWatchers([
        'extentViewProj',
        'tileClass',
      ], prop => async function () {
        if (process.env.VUELAYERS_DEBUG) {
          this.$logger.log(`${prop} changed, scheduling recreate...`)
        }

        await this.scheduleRecreate()
      }),
    },
    created () {
      if (isFunction(this.sealFormatFactory)) {
        this.format = this.instanceFactoryCall(this.formatIdent, ::this.sealFormatFactory)
        // this.$watch('format', async () => {
        //   if (process.env.VUELAYERS_DEBUG) {
        //     this.$logger.log('format changed, scheduling recreate...')
        //   }
        //
        //   await this.scheduleRecreate()
        // })
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
          projection: this.projection,
          state: this.currentState,
          wrapX: this.wrapX,
          // ol/source/Tile
          cacheSize: this.cacheSize,
          tileGrid: this.tileGrid,
          transition: this.transition,
          zDirection: this.zDirection,
          // ol/source/UrlTile
          tileLoadFunction: this.resolvedTileLoadFunc,
          tileUrlFunction: this.resolvedTileUrlFunc,
          // ol/source/VectorTile
          format: this.format,
          extent: this.extentViewProj,
          overlaps: this.overlaps,
          tileClass: this.tileClass,
        })
      },
      async getFeaturesInExtent (extent) {
        return (await this.resolveSource()).getFeaturesInExtent(this.extentToViewProj(extent))
      },
      async getOverlaps () {
        return (await this.resolveSource()).getOverlaps()
      },
      async clear () {
        (await this.resolveSource()).clear()
      },
    },
  }
</script>
