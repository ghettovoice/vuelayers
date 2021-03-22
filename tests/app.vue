<template>
  <div id="app">
    <button @click="features = savedFeatures.slice()">
      Set
    </button>
    <button @click="features = []">
      Unset
    </button>
    <VlMap data-projection="EPSG:4326">
      <VlView
        :zoom.sync="zoom"
        :center.sync="center" />
      <VlLayerTile>
        <VlSourceOsm />
      </VlLayerTile>
      <VlLayerVector>
        <VlSourceCluster>
          <VlSourceVector :features.sync="features" />
        </VlSourceCluster>
      </VlLayerVector>
      <VlInteractionSelect
        :features.sync="selectedFeatures" />
    </VlMap>
  </div>
</template>

<script>
  import { random, range } from 'lodash'

  export default {
    name: 'App',
    data: function () {
      return {
        zoom: 1,
        center: [0, 0],
        features: [],
        selectedFeatures: [],
        savedFeatures: range(0, 100).map(i => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              random(-50, 50),
              random(-50, 50),
            ],
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
