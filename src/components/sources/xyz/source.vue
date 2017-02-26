<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
  import ol from 'openlayers'
  import { createTileUrlFunction } from 'ol3-tilecache'
  import { isNumber, pick } from 'lodash/fp'
  import { TILE_SIZE, createAttributions } from 'vuelayers/src/ol'
  import source from 'vuelayers/src/mixins/source'
  import { replaceTokens } from 'vuelayers/src/utils/func'

  const urlTokens = [
    'layerName',
    'tileFormat'
  ]
  const pickUrlTokens = pick(urlTokens)

  const props = {
    url: String,
    tileFormat: {
      type: String,
      default: 'png'
    },
    tileSize: {
      type: Array,
      default: () => [ TILE_SIZE, TILE_SIZE ],
      validator: value => Array.isArray(value) && value.length === 2 || isNumber(value)
    },
    tilePixelRatio: {
      type: Number,
      default: 1
    },
    layerName: String,
    crossOrigin: {
      type: String,
      default: 'anonymous'
    },
    cacheSize: {
      type: Number,
      default: 2048
    }
  }

  const computed = {
    tileSizeArray () {
      return Array.isArray(this.tileSize) ? this.tileSize : [ this.tileSize, this.tileSize ]
    }
  }

  const methods = {
    createSource () {
      return new ol.source.XYZ({
        attributions: createAttributions(this.attributions),
        tileUrlFunction: this.createTileUrlFunction(),
        crossOrigin: this.crossOrigin,
        projection: this.projection,
        tileSize: this.tileSizeArray,
        tilePixelRatio: this.tilePixelRatio
      })
    },
    /**
     * @return {ol.TileUrlFunction}
     * @protected
     */
    createTileUrlFunction () {
      return createTileUrlFunction(replaceTokens(this.url, pickUrlTokens(this)))
    }
  }

  export default {
    name: 'vl-xyz-source',
    mixins: [ source ],
    props,
    computed,
    methods
  }
</script>
