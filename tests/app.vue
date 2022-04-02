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
        <VlStyle>
          <VlStyleIcon
            :rotation="rotation"
            :scale="scale"
            :src="src" />
        </VlStyle>
      </VlLayerVector>
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 2,
        center: [0, 0],
        features: range(1, 10).map(i => ({
          type: 'Feature',
          id: 'feature' + i,
          geometry: {
            type: 'Point',
            coordinates: [
              random(80, -80),
              random(80, -80),
            ],
          },
        })),
        scale: 0.1,
        rotation: 0,
        src: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
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
