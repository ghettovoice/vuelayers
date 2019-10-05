<script>
  import { Tile as TileLayer } from 'ol/layer'
  import { layer } from '../../mixin'
  import { obsFromOlChangeEvent } from '../../rx-ext'

  /**
   * Layer that provide pre-rendered, tiled images in grid that are organized by zoom levels for
   * specific resolutions. `vl-tile-layer` component implements a **source container** interface, so it should be
   * used together with tile-like `vl-source-*` components.
   */
  export default {
    name: 'VlLayerTile',
    mixins: [layer],
    props: {
      /**
       * Load low-resolution tiles up to `preload` levels.
       * @type {number}
       * @default 0
       */
      preload: {
        type: Number,
        default: 0,
      },
      useInterimTilesOnError: {
        type: Boolean,
        default: true,
      },
    },
    watch: {
      preload (value) {
        this.setPreload(value)
      },
      useInterimTilesOnError (value) {
        this.setUseInterimTilesOnError(value)
      },
    },
    methods: {
      /**
       * @return {Tile}
       * @protected
       */
      createLayer () {
        return new TileLayer({
          id: this.id,
          className: this.className,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          zIndex: this.zIndex,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          render: this.render,
          preload: this.preload,
          useInterimTilesOnError: this.useInterimTilesOnError,
          source: this.$source,
        })
      },
      /**
       * @returns {Promise<number>}
       */
      async getPreload () {
        return (await this.resolveLayer()).getPreload()
      },
      /**
       * @param {number} preload
       * @returns {Promise<void>}
       */
      async setPreload (preload) {
        const layer = await this.resolveLayer()

        if (preload === layer.getPreload()) return

        layer.setPreload(preload)
      },
      /**
       * @returns {Promise<boolean>}
       */
      async getUseInterimTilesOnError () {
        return (await this.resolveLayer()).getUseInterimTilesOnError()
      },
      /**
       * @param {boolean} useInterimTilesOnError
       * @returns {Promise<void>}
       */
      async setUseInterimTilesOnError (useInterimTilesOnError) {
        const layer = await this.resolveLayer()

        if (useInterimTilesOnError === layer.getUseInterimTilesOnError()) return

        layer.setUseInterimTilesOnError(useInterimTilesOnError)
      },
      /**
       * @returns {Promise<void>}
       */
      subscribeAll () {
        return Promise.all([
          this::layer.methods.subscribeAll(),
          this::subscribeToLayerEvents(),
        ])
      },
    },
  }

  async function subscribeToLayerEvents () {
    const layer = await this.resolveLayer()

    const t = 1000 / 60
    const changes = obsFromOlChangeEvent(layer, [
      'preload',
      'useInterimTilesOnError',
    ], true, t)

    this.subscribeTo(changes, ({ prop, value }) => {
      ++this.rev

      this.$nextTick(() => {
        this.$emit(`update:${prop}`, value)
      })
    })
  }
</script>
