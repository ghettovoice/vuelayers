<template>
  <div id="app">
    <VlMap
      ref="map"
      data-projection="EPSG:4326">
      <VlView
        :center.sync="center"
        :zoom.sync="zoom" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>

      <VlLayerVector>
        <VlSourceVector
          :features.sync="features" />
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'

  export default {
    name: 'App',
    data () {
      return {
        zoom: 2,
        center: [0, 0],
        features: range(1, 100).map(i => ({
          type: 'Feature',
          id: 'feature' + i,
          geometry: {
            type: 'Point',
            coordinates: [
              random(80, -80),
              random(80, -80),
            ],
          },
          properties: {
            name: 'feature ' + i,
          },
        })),
      }
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "~ol/ol";

  html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    font-family: Helvetica, Arial, sans-serif;
    overflow: hidden;

    * {
      box-sizing: border-box;
    }
  }
</style>
